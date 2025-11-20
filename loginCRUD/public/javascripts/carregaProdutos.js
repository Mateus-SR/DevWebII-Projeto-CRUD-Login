document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    const tipoPagina = container.getAttribute('tipoData');

    const configuracoes = {
        'hqs': {
            endpoint: '/hqs',
            getDescricao: (item) => `Tipo: ${item.tipo} | Gênero: ${item.genero ? item.genero.join(', ') : 'N/A'}`,
            getTitulo: (item) => item.nome
        },
        'livros': {
            endpoint: '/livros',
            getDescricao: (item) => `Ano: ${item.ano} | Gênero: ${item.genero ? item.genero.join(', ') : 'N/A'}`,
            getTitulo: (item) => item.nome
        },
        'cds': {
            endpoint: '/cds',
            getDescricao: (item) => `Ano: ${item.ano} | Faixas: ${item.faixasTotal || 0}`,
            getTitulo: (item) => item.titulo
        },
        'dvds': {
            endpoint: '/dvds',
            getDescricao: (item) => `Duração: ${item.duracao} min | Ano: ${item.ano}`,
            getTitulo: (item) => item.nome
        },
        'autores': {
            endpoint: '/autores',
            getDescricao: (item) => `Nacionalidade: ${item.nacionalidade}`,
            getTitulo: (item) => item.nome
        }
    };

    const config = configuracoes[tipoPagina]
    if(!config) {
        console.warn("Tipo de página desconhecido:", tipoPagina)
        return;
    }

    try {
        const response = await fetch(`${VERCEL_URL}${config.endpoint}`);
        const itens = await response.json();

        container.innerHTML = '';

        itens.forEach(item => {
            const templateClone = template.content.cloneNode(true);

            const img = templateClone.querySelector('.divFotoItem');
            const titulo = templateClone.querySelector('.divTitulo')
            const descricao = templateClone.querySelector('.divDescricao');

            titulo.textContent = config.getTitulo(item);
            descricao.textContent = config.getDescricao(item);

            if (item.urlCapa) {
                img.src = item.urlCapa;
            } else {
                img.src = '../images/SEBOZO.png'
            }
            img.alt = config.getTitulo(item);

            container;appendChild(templateClone)
        });
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
        container.innerHTML = `        <div class="font-comfortaa">
        <p class="text-teal-800 text-2xl font-extrabold">Erro!</p>
        <p class="text-black text-md italic">Ocorreu um erro ao carregar os itens.</p>
    </div>`
    }
});