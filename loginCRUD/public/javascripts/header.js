document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo');
    logo.onclick = (e) => {
        window.location.href = 'index.html';
    }
    // Configurando os botões que devem aparecer somente logado/deslogado
    const botaoConta = document?.getElementById('botaoConta');
    if (botaoConta) {
        const jwt_token = getTokenJWT();
        if (jwt_token) {
            botaoConta.innerHTML = `<span class="flex items-center justify-center p-5 h-full hover:bg-teal-400 transition-all duration-300 hover:animate-bump cursor-pointer">Sair</span>`;
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

    const divDropdown = document.getElementById('divDropdown');
    const linksDropdown = document.getElementById('linksDropdown');

    // Toggle do Menu Principal
    divDropdown?.addEventListener('click', (e) => {
        // Apenas fecha/abre se clicar no botão principal ou no container vazio, 
        // não se clicar nos botões internos (abaixo)
        if (e.target.closest('button') === divDropdown.querySelector('button')) {
            linksDropdown.classList.toggle("hidden");
        }
    });

    // Função para controlar os sub-menus
    function toggleSubMenu(botaoId, listaId, iconeId) {
        const botao = document.getElementById(botaoId);
        const lista = document.getElementById(listaId);
        const icone = document.getElementById(iconeId);

        if (botao) {
            botao.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique feche o menu principal
                lista.classList.toggle('hidden');
                if (icone) icone.classList.toggle('rotate-180');
            });
        }
    }

    toggleSubMenu('btnProdutos', 'listProdutos', 'iconProdutos');
    toggleSubMenu('btnCriadores', 'listCriadores', 'iconCriadores');

    // Fechar ao clicar fora
    window.onclick = function(e) {
        if (!divDropdown?.contains(e.target)) {
            if (linksDropdown && !linksDropdown.classList.contains('hidden')) {
                linksDropdown.classList.add('hidden');
                // Opcional: Fechar sub-menus ao sair
                document.getElementById('listProdutos')?.classList.add('hidden');
                document.getElementById('listCriadores')?.classList.add('hidden');
            }
        }
    };
});