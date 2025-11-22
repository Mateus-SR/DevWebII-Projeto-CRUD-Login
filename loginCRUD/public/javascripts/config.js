const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

// Funções mais básicas para interagir com o jwt_token

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

// Função especial, pois precisamos verificar antes se estamos mesmo autenticados para criar algo
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