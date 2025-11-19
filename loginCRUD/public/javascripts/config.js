document.addEventListener('DOMContentLoaded', () => {
    checkAuth();


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

    function checkAuth() {
        const token = getTokenJWT();
        if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('cadastro.html'))) {
            window.location.href = 'index.html';
        }
    }

});