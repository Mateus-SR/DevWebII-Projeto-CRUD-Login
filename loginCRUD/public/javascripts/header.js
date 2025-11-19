import { getTokenJWT, setTokenJWT, logout, checkAuth } from './config.js';


document.addEventListener('DOMContentLoaded', () => {
    const botaoConta = document?.getElementById('botaoConta'); // Seleciona o span da engrenagem
    
    if (botaoConta) {
        const jwt_token = getTokenJWT();

        if (jwt_token) {
            botaoConta.textContent = "Sair";
            botaoConta.onclick = () => {
                logout(); // Chama a função do config.js
            };
        } else {
            // Usuário DESLOGADO
            botaoConta.innerHTML = '<a href="login.html">Fazer Login</a>';
        }
    }
});