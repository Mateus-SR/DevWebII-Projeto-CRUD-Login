document.addEventListener('DOMContentLoaded', () => {
    const botaoConta = document?.getElementById('botaoConta'); // Seleciona o span da engrenagem
    
    if (botaoConta) {
        const token = getToken();

        if (token) {
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