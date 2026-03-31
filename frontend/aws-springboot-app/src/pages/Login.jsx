import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/login.css";
import { useAuth } from "../hooks/useAuth.jsx";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const handleLogin = async () => {
       
        setError("");

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            // TEMP PASSWORD FLOW
            if (data.message === "NEW_PASSWORD_REQUIRED") {
                sessionStorage.setItem("email", email);
                sessionStorage.setItem("sessionToken", data.session);
                navigate("/new-password");
                return;
            }

            // SUCCESS
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            login()
            navigate("/dashboard");

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-wrapper">
            {/* LEFT PANEL */}
            <div className="login-left">
                <div className="brand">
                    <span className="logo">{"</>"}</span>
                    <h3 style={{color:"black"}}>First Website</h3>
                </div>

                <h1 style={{color:"black"}}>Welcome Back!</h1>
                <p className="subtitle" style={{color:"black"}}>
                    Sign in to access your dashboard and continue optimizing your workflow.
                </p>

                <label style={{color:"black"}}>Email</label>
                <input style={{color:"black"}}
                    placeholder="Enter your email"
                    onChange={e => setEmail(e.target.value)}
                />

                <label style={{color:"black"}}>Password</label>

<div className="password-wrapper">
    <input
        style={{ color: "black" }}
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        onChange={e => setPassword(e.target.value)}
    />

    <span
        className="eye-icon"
        onClick={() => setShowPassword(!showPassword)}
        title={showPassword ? "Hide password" : "Show password"}
    >
        {showPassword ? "🙈" : "👁️"}
    </span>
</div>

                <div className="forgot">
                    <span onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <button className="primary-btn" onClick={handleLogin}>
                    Login
                </button>

                <p className="signup" style={{color:"black"}}>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")}>Sign Up</span>
                </p>

                {error && <p className="error">{error}</p>}
            </div>

            {/* RIGHT PANEL */}
            <div className="login-right">
                <h1>
                    Springboot & AWS <br /> with ReactJS
                </h1>

                <p className="quote">
                    “It is a learning of Springboot & AWS Cognito.
                    It involves learn user authentication using cognito.”
                </p>

                <div className="author">
                    <div className="avatar">PS</div>
                    <div>
                        <strong>Partha Sharathy K</strong>
                        <p>Backend Intern at 247 HMP</p>
                    </div>
                </div>

                <div className="logos">
                    <span>LinkedIn</span>
                    <span>Github</span>
                    <span>LeetCode</span>
                    <span>CodeChef</span>
                </div>
            </div>
        </div>
    );
}
