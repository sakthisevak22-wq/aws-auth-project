package com.partha.aws.aws_springboot_project.service;

import com.partha.aws.aws_springboot_project.repository.UserTokenRepository;
import com.partha.aws.aws_springboot_project.util.SecretHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import com.partha.aws.aws_springboot_project.document.UserToken;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final SecretHashUtil secretHashUtil;
    private final UserTokenRepository userTokenRepository;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws.cognito.client-id}")
    private String clientId;

    @Value("${aws.cognito.client-secret}")
    private String clientSecret;

    // =====================================================
    // CREATE USER + ADD TO GROUP
    // =====================================================
    public void createUser(String email, String name, String tempPassword, String group) {

        cognitoClient.adminCreateUser(
                AdminCreateUserRequest.builder()
                        .userPoolId(userPoolId)
                        .username(email)
                        .temporaryPassword(tempPassword)
                        .messageAction(MessageActionType.SUPPRESS)
                        .userAttributes(
                                AttributeType.builder().name("email").value(email).build(),
                                AttributeType.builder().name("email_verified").value("true").build(),
                                AttributeType.builder().name("name").value(name).build()
                        )
                        .build()
        );

        cognitoClient.adminAddUserToGroup(
                AdminAddUserToGroupRequest.builder()
                        .userPoolId(userPoolId)
                        .username(email)
                        .groupName(group)
                        .build()
        );
    }

    // =====================================================
    // SET PERMANENT PASSWORD (ADMIN)
    // =====================================================
    public void setPermanentPassword(String email, String newPassword) {

        cognitoClient.adminSetUserPassword(
                AdminSetUserPasswordRequest.builder()
                        .userPoolId(userPoolId)
                        .username(email)
                        .password(newPassword)
                        .permanent(true)
                        .build()
        );
    }

    // =====================================================
    // LOGIN (PERMANENT / TEMP PASSWORD)
    // =====================================================
    public Map<String, Object> login(String email, String password) {

        Map<String, String> authParams = new HashMap<>();
        authParams.put("USERNAME", email);
        authParams.put("PASSWORD", password);
        authParams.put(
                "SECRET_HASH",
                secretHashUtil.calculateSecretHash(email, clientId, clientSecret)
        );

        InitiateAuthResponse response =
                cognitoClient.initiateAuth(
                        InitiateAuthRequest.builder()
                                .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                                .clientId(clientId)
                                .authParameters(authParams)
                                .build()
                );

        // TEMP PASSWORD CASE
        if (response.challengeName() == ChallengeNameType.NEW_PASSWORD_REQUIRED) {
            return Map.of(
                    "message", "NEW_PASSWORD_REQUIRED",
                    "session", response.session()
            );
        }

        // PERMANENT PASSWORD SUCCESS
        AuthenticationResultType result = response.authenticationResult();
        return buildAuthResponse(result, email);
    }

    // =====================================================
    // TEMP PASSWORD → NEW PASSWORD
    // =====================================================
    public Map<String, Object> setNewPassword(
            String email,
            String newPassword,
            String session) {

        Map<String, String> challengeResponses = new HashMap<>();
        challengeResponses.put("USERNAME", email);
        challengeResponses.put("NEW_PASSWORD", newPassword);
        challengeResponses.put(
                "SECRET_HASH",
                secretHashUtil.calculateSecretHash(email, clientId, clientSecret)
        );

        RespondToAuthChallengeResponse challengeResponse =
                cognitoClient.respondToAuthChallenge(
                        RespondToAuthChallengeRequest.builder()
                                .clientId(clientId)
                                .challengeName(
                                        ChallengeNameType.NEW_PASSWORD_REQUIRED)
                                .session(session)
                                .challengeResponses(challengeResponses)
                                .build()
                );

        AuthenticationResultType result =
                challengeResponse.authenticationResult();

        return buildAuthResponse(result, email);
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================
    public void forgotPassword(String email) {

        cognitoClient.forgotPassword(
                ForgotPasswordRequest.builder()
                        .clientId(clientId)
                        .username(email)
                        .secretHash(
                                secretHashUtil.calculateSecretHash(
                                        email, clientId, clientSecret))
                        .build()
        );
    }

    // =====================================================
    // CONFIRM FORGOT PASSWORD
    // =====================================================
    public void confirmForgotPassword(
            String email,
            String otp,
            String newPassword) {

        cognitoClient.confirmForgotPassword(
                ConfirmForgotPasswordRequest.builder()
                        .clientId(clientId)
                        .username(email)
                        .confirmationCode(otp)
                        .password(newPassword)
                        .secretHash(
                                secretHashUtil.calculateSecretHash(
                                        email, clientId, clientSecret))
                        .build()
        );
    }

    public void verifyUserEmail(String email) {

        cognitoClient.adminUpdateUserAttributes(
                AdminUpdateUserAttributesRequest.builder()
                        .userPoolId(userPoolId)
                        .username(email)
                        .userAttributes(
                                AttributeType.builder()
                                        .name("email_verified")
                                        .value("true")
                                        .build()
                        )
                        .build()
        );
    }

    // =====================================================
    // LOGOUT (GLOBAL SIGN OUT)
    // =====================================================

    public void logout(String accessToken) {

        cognitoClient.globalSignOut(
                GlobalSignOutRequest.builder()
                        .accessToken(accessToken)
                        .build()
        );

        userTokenRepository.findByAccessToken(accessToken)
                .ifPresent(token -> {
                    token.setLoggedOut(true);
                    userTokenRepository.save(token);
                });
    }

    // =====================================================
    // MONGODB
    // =====================================================
    private Map<String, Object> buildAuthResponse(
            AuthenticationResultType result,
            String username) {

        UserToken token = new UserToken();
        token.setUsername(username);
        token.setAccessToken(result.accessToken());
        token.setRefreshToken(result.refreshToken());
        token.setIdToken(result.idToken());
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(
                LocalDateTime.now().plusSeconds(result.expiresIn())
        );
        token.setLoggedOut(false);

        userTokenRepository.save(token);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", result.accessToken());
        response.put("idToken", result.idToken());
        response.put("refreshToken", result.refreshToken());
        response.put("expiresIn", result.expiresIn());
        response.put("tokenType", result.tokenType());

        return response;
    }

    // =====================================================
    // REVOKE REFRESH TOKEN
    // =====================================================
    public void revokeRefreshToken(String refreshToken) {

        cognitoClient.revokeToken(
                RevokeTokenRequest.builder()
                        .clientId(clientId)
                        .clientSecret(clientSecret)
                        .token(refreshToken)
                        .build()
        );

        // Optional: mark related sessions in MongoDB if you want
        // (Revoke affects refresh token only; access token still valid till expiry)
    }

}
