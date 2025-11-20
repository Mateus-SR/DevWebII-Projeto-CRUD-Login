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
            botaoConta.innerHTML = `
                <a href="login.html" class="flex items-center justify-center py-5 h-full hover:bg-teal-400 transition-all duration-300 hover:animate-bump">Faça Login</a>
                <span>ou</span>
                <a href="cadastro.html" class="flex items-center justify-center py-5 h-full hover:bg-teal-400 transition-all duration-300 hover:animate-bump">Cadastre-se</a>
                `;
        }
    }
});