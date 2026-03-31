const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function loginApi(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
}

export async function newPasswordApi(email, newPassword, sessionToken) {
    const res = await fetch(`${API_BASE}/auth/new-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, sessionToken })
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Password update failed");
    return data;
}

export async function forgotPasswordApi(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    if (!res.ok) throw new Error("OTP send failed");
}

export async function confirmForgotPasswordApi(email, otp, newPassword) {
    const res = await fetch(`${API_BASE}/auth/confirm-forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
    });

    if (!res.ok) throw new Error("Password reset failed");
}

export async function logoutApi(accessToken) {
    await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
}

export async function addUserApi(payload) {
    const res = await fetch(`${API_BASE}/auth/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("User creation failed");
}
