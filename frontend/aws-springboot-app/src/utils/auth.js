export function saveTokens(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
}

export function clearTokens() {
    localStorage.clear();
    sessionStorage.clear();
}

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}
