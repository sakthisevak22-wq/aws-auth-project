import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/login.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);


    // STEP 1: SEND OTP
    const sendOtp = async () => {
        try {
            const res = await fetch(
                `${API_BASE}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                }
            );

            if (!res.ok) {
                throw new Error("Failed to send OTP");
            }

            setStep(2);
            setMsg("OTP sent to your email");

        } catch (err) {
            setMsg(err.message);
        }
    };

    // STEP 2: CONFIRM OTP + NEW PASSWORD
    const resetPassword = async () => {
        try {
            const res = await fetch(
                `${API_BASE}/auth/confirm-forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otp,
                        newPassword
                    })
                }
            );

            if (!res.ok) {
                throw new Error("Password reset failed");
            }

            setMsg("Password reset successful");
            setTimeout(() => navigate("/"), 2000);

        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
    <div className="forgot-wrapper">
        <div className="forgot-card">
            <h2>Forgot Password</h2>
            <p className="subtitle">
                {step === 1
                    ? "Enter your email to receive an OTP"
                    : "Enter the OTP and set a new password"}
            </p>

            {step === 1 && (
                <>
                    <input
                        className="forgot-input"
                        placeholder="Enter your email"
                        onChange={e => setEmail(e.target.value)}
                    />
                    <button className="primary-btn" onClick={sendOtp}>
                        Send OTP
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <input
                        className="forgot-input"
                        placeholder="Enter OTP"
                        onChange={e => setOtp(e.target.value)}
                    />
                    <div className="password-wrapper">
    <input
        className="forgot-input"
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
        onChange={e => setNewPassword(e.target.value)}
    />

    <span
        className="eye-icon"
        onClick={() => setShowPassword(!showPassword)}
    >
        {showPassword ? "🙈" : "👁️"}
    </span>
</div>

                    <button className="primary-btn" onClick={resetPassword}>
                        Reset Password
                    </button>
                </>
            )}

            {msg && <p className="success-msg">{msg}</p>}
        </div>
    </div>
);
}
