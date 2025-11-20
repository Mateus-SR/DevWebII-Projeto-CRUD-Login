document.addEventListener('DOMContentLoaded', () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const dados = {
                email: email,
                password: password
            };

            try {
                const response = await fetch(`${VERCEL_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const result = await response.json();

                if (response.ok) {
                    setTokenJWT(result.token);
                    alert('Login realizado com sucesso!');
                    window.location.href = 'index.html';
                } else {
                    alert(`Erro: ${result.message}`);
                }

            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao tentar fazer login. Verifique sua conexão.');
            }
        });
    }
});