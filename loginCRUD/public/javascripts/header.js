document.addEventListener('DOMContentLoaded', () => {
    if (botaoConta) {
        const botaoConta = document?.getElementById('botaoConta');
        const jwt_token = getTokenJWT();

        if (jwt_token) {
            botaoConta.textContent = "Sair";
            botaoConta.href = "#"; 
            botaoConta.onclick = (e) => {
                e.preventDefault();
                logout(); 
            };
        } else {
            botaoConta.innerHTML = '<a href="login.html">Fazer Login</a>';
        }
    }
});