const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

function getTokenJWT() {
    return localStorage.getItem('jwt_token');
}

function setTokenJWT(jwt_token) {
    return localStorage.setItem('jwt_token', jwt_token);
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'index.html';
}

function checkAuth() {
    const token = getTokenJWT();
    if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('cadastro.html'))) {
        window.location.href = 'index.html';
    }
}

async function criarItem(endpoint, dados) {
    const token = getTokenJWT();
    if (!token) return { erro: "Sem token" };

    const response = await fetch(`${VERCEL_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
    });
    return await response.json();
}