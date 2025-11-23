document.addEventListener('DOMContentLoaded', () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";
    const loginForm = document.getElementById('loginForm');
    // verifica se estamos na pagina certa/se o elemento existe aqui para trabalharmos com ele
    // a logica é basicamente a mesma do cadastro, so que ao invés de criar um novo usuario, verificamos se o que ele inseriu existe, e se podemos permitir ele logar na conta

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Pega os dados...
            const dados = {
                email: email,
                password: password
            };

            try {
                // e manda eles (post) pra verificar
                const response = await fetch(`${VERCEL_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const result = await response.json();

                // tudo estando correto, guarda o token que foi criado, e manda pro index.html
                if (response.ok) {
                    setTokenJWT(result.token);
                    alert('Login realizado com sucesso!');
                    window.location.href = 'index.html';
                } else {
                    // ou então dá erro, e impede o login
                    alert(`Erro: ${result.message}`);
                }

            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao tentar fazer login. Verifique sua conexão.');
            }
        });
    }
});