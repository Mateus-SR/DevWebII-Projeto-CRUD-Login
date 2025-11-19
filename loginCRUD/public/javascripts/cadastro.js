document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('text').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const dados = {
                username: username,
                email: email,
                password: password
            };

            try {
                const response = await fetch(`${VERCEL_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Cadastro realizado com sucesso! Faça login para continuar.');
                    window.location.href = 'login.html';
                } else {
                    alert(`Erro no cadastro: ${result.error || result.message}`);
                    if (result.details) console.log(result.details);
                }

            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão ao tentar cadastrar.');
            }
        });
    }
});