import { useAuth } from "../hooks/useAuth.jsx";
import { useState } from "react";
import "../assets/login.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
    const { logout } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("USER");
    const [msg, setMsg] = useState("");

    // STATIC TEMP PASSWORD
    const TEMP_PASSWORD = "Temp@123";

    const addUser = async () => {
        setMsg("");

        try {
            const res = await fetch(`${API_BASE}/auth/add-user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify({
                    name,
                    email,
                    group: role,
                    temporaryPassword: TEMP_PASSWORD
                })
            });

            if (!res.ok) {
                throw new Error("Failed to create user");
            }

            setMsg(`User created as ${role}`);
            setName("");
            setEmail("");
            setRole("USER");

        } catch (err) {
            setMsg(err.message);
        }
    };

    return (
    <div className="dashboard-wrapper">
        <div className="dashboard-card">
            <h2>Superadmin Dashboard</h2>
            <p className="subtitle">Create and manage users</p>

            <div className="add-user-card">
                <h3>Add User</h3>

                <input
                    className="forgot-input"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <input
                    className="forgot-input"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <select
                    className="forgot-input"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Superadmin</option>
                </select>

                <div className="temp-pass">
                    Temporary Password: <strong>{TEMP_PASSWORD}</strong>
                </div>

                <button className="primary-btn" onClick={addUser}>
                    Create User
                </button>

                {msg && <p className="success-msg">{msg}</p>}
            </div>

            <button className="logout-btn" onClick={logout}>
                Logout
            </button>
        </div>
    </div>
);
}
