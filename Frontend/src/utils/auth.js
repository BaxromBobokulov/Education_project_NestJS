import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * JWT tokenni dekod qiladi.
 * Token yo'q, noto'g'ri yoki muddati o'tgan bo'lsa null qaytaradi.
 */
export function decodeToken(token = getToken()) {
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        if (decoded.exp) {
            const nowInSeconds = Math.floor(Date.now() / 1000);
            if (decoded.exp < nowInSeconds) {
                removeToken();
                return null;
            }
        }

        return decoded;
    } catch {
        removeToken();
        return null;
    }
}

export function getCurrentUser() {
    return decodeToken();
}

export function isAuthenticated() {
    return getCurrentUser() !== null;
}

export function getUserRole() {
    return getCurrentUser()?.role ?? null;
}

export function hasRole(allowedRoles = []) {
    const role = getUserRole();
    if (!role || !allowedRoles.length) return false;
    return allowedRoles.includes(role);
}

export function logout() {
    removeToken();
}

export function getAuthHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
