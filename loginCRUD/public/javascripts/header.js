document.addEventListener('DOMContentLoaded', () => {
    const botaoConta = document?.getElementById('botaoConta');
    
    if (botaoConta) {
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