import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/login.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function NewPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const submitNewPassword = async () => {
        const email = sessionStorage.getItem("email");
        const sessionToken = sessionStorage.getItem("sessionToken");

        if (!email || !sessionToken) {
            setMsg("Session expired. Please login again.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/new-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    newPassword,
                    sessionToken
                })
            });

            if (!res.ok) {
                throw new Error("Password update failed");
            }

            const data = await res.json();

            // save tokens
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            sessionStorage.clear();
            navigate("/dashboard");

        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
    <div className="forgot-wrapper">
        <div className="forgot-card">
            <h2>Set New Password</h2>
            <p className="subtitle">
                Create a strong password to secure your account
            </p>

            <input
                className="forgot-input"
                type="password"
                placeholder="Enter new password"
                onChange={e => setNewPassword(e.target.value)}
            />

            <button className="primary-btn" onClick={submitNewPassword}>
                Update Password
            </button>

            {msg && <p className="error-msg">{msg}</p>}
        </div>
    </div>
);

}
