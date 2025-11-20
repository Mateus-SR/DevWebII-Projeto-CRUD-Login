document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    const tipoPagina = container.getAttribute('tipoData');

    const configuracoes = {
        'hqs': { //adicionar os demais campos do banco de dados
            endpoint: '/hqs',
            getDescricao: (item) => `Tipo: ${item.tipo}\nGênero: ${item.genero ? item.genero.join(', ') : 'N/A'}`,
            getTitulo: (item) => item.nome,
            getTituloAlt: (item) => item.nomeAlt && item.nomeAlt.length > 0 ? item.nomeAlt.join(', ') : ''        },
        'livros': {
            endpoint: '/livros',
            getDescricao: (item) => `Ano: ${item.ano}\nGênero: ${item.genero ? item.genero.join(', ') : 'N/A'}`,
            getTitulo: (item) => item.nome
        },
        'cds': {
            endpoint: '/cds',
            getDescricao: (item) => `Ano: ${item.ano}\nTotal de faixas: ${item.faixasTotal || 0}`,
            getTitulo: (item) => item.titulo
        },
        'dvds': {
            endpoint: '/dvds',
            getDescricao: (item) => `Duração: ${item.duracao} min\nAno: ${item.ano}`,
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

            const img = templateClone.querySelector('.fotoItem');
            const titulo = templateClone.querySelector('.divTitulo')
            const tituloAlt = templateClone.querySelector('.divTituloAlt')
            const descricao = templateClone.querySelector('.divDescricao');

            titulo.textContent = config.getTitulo(item);

            if (config.getTituloAlt) {
                const alt = config.getTituloAlt(item);
                if (alt) {
                    tituloAlt.textContent = config.getTituloAlt(item);
                }
            } else {
                tituloAlt.remove();
            }

            descricao.textContent = config.getDescricao(item);

            if (item.urlCapa) {
                img.src = item.urlCapa;
            } else {
                img.src = '../public/images/imgN-A.png'
            }
            img.alt = config.getTitulo(item);

            container.appendChild(templateClone)
        });
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
        container.innerHTML = `        <div class="font-comfortaa">
        <p class="text-teal-800 text-2xl font-extrabold">Erro!</p>
        <p class="text-black text-md italic">Ocorreu um erro ao carregar os itens.</p>
    </div>`
    }
});