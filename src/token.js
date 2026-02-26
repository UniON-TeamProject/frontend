export function getToken() {
    return sessionStorage.getItem("token") || localStorage.getItem("token");
}

export function saveToken(token, remember = false) {
    if (remember) {
        localStorage.setItem("token", token);
    } else {
        sessionStorage.setItem("token", token);
    }
}

export function removeToken() {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
}
