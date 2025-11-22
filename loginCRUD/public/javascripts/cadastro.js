document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    // verifica se estamos na pagina certa/se o elemento existe aqui para trabalharmos com ele
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // impedindo que o formulário tenha o comportamento padrão do html (recarregar página)

            // Pegando os valores inseridos...
            const username = document.getElementById('text').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // ... juntamos eles em um objeto...
            const dados = {
                username: username,
                email: email,
                password: password
            };

            try {
                // ... e mandamos eles pro vercel fazer suas verificações
                const response = await fetch(`${VERCEL_URL}/auth/register`, {
                    method: 'POST', // qual tipo de rota estamos fazendo
                    headers: {
                        'Content-Type': 'application/json' // e qual tipo de coisa tem nesse post
                    },
                    body: JSON.stringify(dados) // transformando em json
                });

                // guardando a resposta
                const result = await response.json();

                if (response.ok) {
                    // se o status for algum entre 200 e 299, que significa "sucesso", podemos continuar...
                    alert('Cadastro realizado com sucesso! Faça login para continuar.');
                    window.location.href = 'login.html';
                    // (Nesse caso, conseguimos validar os dados e inserir eles no banco de dados)
                } else {
                    // ... mas caso não dê certo, não continuamos 
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