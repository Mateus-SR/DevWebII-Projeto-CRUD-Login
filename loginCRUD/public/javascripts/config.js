const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

function getTokenJWT() {
    return localStorage.getItem('jwt_token');
}

function setTokenJWT(jwt_token) {
    return localStorage.setItem('jwt_token', jwt_token);
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/loginCRUD/views/index.html';
}