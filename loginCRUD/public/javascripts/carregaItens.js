document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    const tipoPagina = container.getAttribute('tipoData');

    // --- Funções Auxiliares de Formatação ---

    // Cria um link para a página de edição/visualização do autor
    const formatarAutorLink = (autorOuLista) => {
        if (!autorOuLista) return 'Desconhecido';
        
        const criarLink = (a) => `<a href="../views/autores.html?tipo=autores&id=${a._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">${a.nome}</a>`;

        if (Array.isArray(autorOuLista)) {
            if (autorOuLista.length === 0) return 'Desconhecido';
            return autorOuLista.map(criarLink).join(', ');
        }
        return criarLink(autorOuLista);
    };

    // Cria uma lista visual para Volumes e Faixas com rolagem
    const formatarLista = (lista, tipo) => {
        if (!lista || lista.length === 0) return '';
        
        let html = `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-32 overflow-y-auto text-sm border border-teal-600/30">`;
        html += `<p class="font-bold text-xs uppercase mb-1 opacity-70">${tipo}:</p><ul class="list-disc pl-4 space-y-1">`;
        
        lista.forEach((item, index) => {
            let texto = '';
            if (tipo === 'Volumes') {
                texto = `Vol. ${item.volume}: ${item.titulo || ''} ${!item.emEstoque ? '(Sem Estoque)' : ''}`;
            } else if (tipo === 'Faixas') {
                texto = `${index + 1}. ${item.titulo} <span class="opacity-60 text-xs">(${item.duracao || '--:--'})</span>`;
            }
            html += `<li>${texto}</li>`;
        });
        
        html += `</ul></div>`;
        return html;
    };

    // --- Configurações ---

    const configuracoes = {
        'hqs': {
            endpoint: '/hqs',
            getDescricao: (item) => {
                const generos = item.genero && item.genero.length > 0 ? item.genero.join(', ') : 'N/A';
                const linksAutores = formatarAutorLink(item.autores);
                const listaVolumes = formatarLista(item.volumes, 'Volumes');

                return `<strong>Tipo:</strong> ${item.tipo}<br>
                        <strong>Gênero:</strong> ${generos}<br>
                        <strong>Autores:</strong> ${linksAutores}<br>
                        <strong>Total:</strong> ${item.volumeTotal || 0} volumes
                        ${listaVolumes}`;
            },
            getTitulo: (item) => item.nome,
            getTituloAlt: (item) => {
                 if (!item.nomeAlt || item.nomeAlt.length === 0) return '';
                 const nomesLimpos = item.nomeAlt.flatMap(nome => {
                    if (typeof nome === 'string' && nome.trim().startsWith('[') && nome.trim().endsWith(']')) {
                        try { return JSON.parse(nome); } catch (e) { return nome; }
                    }
                    return nome;
                });
                return nomesLimpos.join('\n');
            }
        },
        'livros': {
            endpoint: '/livros',
            getDescricao: (item) => {
                const generos = item.genero && item.genero.length > 0 ? item.genero.join(', ') : 'N/A';
                const linksAutores = formatarAutorLink(item.autores);

                return `<strong>Ano:</strong> ${item.ano || 'N/A'}<br>
                        <strong>Gênero:</strong> ${generos}<br>
                        <strong>Autores:</strong> ${linksAutores}`;
            },
            getTitulo: (item) => item.nome
        },
        'cds': {
            endpoint: '/cds',
            getDescricao: (item) => {
                const linkAutor = formatarAutorLink(item.autor);
                const listaFaixas = formatarLista(item.faixas, 'Faixas');

                return `<strong>Artista:</strong> ${linkAutor}<br>
                        <strong>Ano:</strong> ${item.ano || 'N/A'}<br>
                        <strong>Total de faixas:</strong> ${item.faixasTotal || 0}
                        ${listaFaixas}`;
            },
            getTitulo: (item) => item.titulo
        },
        'dvds': {
            endpoint: '/dvds',
            getDescricao: (item) => {
                const linkDiretor = formatarAutorLink(item.autor);
                return `<strong>Diretor:</strong> ${linkDiretor}<br>
                        <strong>Duração:</strong> ${item.duracao} min<br>
                        <strong>Ano:</strong> ${item.ano}`;
            },
            getTitulo: (item) => item.nome
        },
        'autores': {
            endpoint: '/autores',
            getDescricao: (item) => {
                // Agrega todas as obras encontradas
                let obras = [];
                if (item.livros && item.livros.length) obras.push(`${item.livros.length} Livros`);
                if (item.hqs && item.hqs.length) obras.push(`${item.hqs.length} HQs`);
                if (item.cds && item.cds.length) obras.push(`${item.cds.length} CDs`);
                if (item.dvds && item.dvds.length) obras.push(`${item.dvds.length} DVDs`);

                const resumoObras = obras.length > 0 ? obras.join(', ') : 'Nenhuma obra cadastrada';

                return `<strong>Nacionalidade:</strong> ${item.nacionalidade || 'N/A'}<br>
                        <strong>Obras no acervo:</strong><br> ${resumoObras}`;
            },
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
                if (alt) tituloAlt.textContent = alt;
            } else {
                tituloAlt.remove();
            }

            // --- MUDANÇA PRINCIPAL AQUI: innerHTML para renderizar HTML ---
            descricao.innerHTML = config.getDescricao(item);
            // -------------------------------------------------------------

            if (item.urlFoto) {
                img.src = item.urlFoto;
            } else {
                img.src = '../public/images/imgN-A.png'
            }
            img.alt = config.getTitulo(item);

            const estaLogado = localStorage.getItem('jwt_token');
            if (estaLogado) {
                const divBotoes = document.createElement('div');
                divBotoes.className = "absolute top-5 md:bottom-5 right-5 mx-auto flex flex-col-reverse md:flex-row gap-5 md:text-md text-sm";

                const botaoEditar = document.createElement('button');
                botaoEditar.innerHTML = "<i class='fas fa-edit' style='font-size:24px'></i>";
                botaoEditar.className = "underline underline-offset-1 w-10 h-10 p-2 bg-teal-800 hover:bg-teal-500 hover:text-white hover:animate-bump cursor-pointer font-roboto-mono text-md aspect-square transition-all duration-300 rounded-lg shadow-sm";

                botaoEditar.onclick = (e) => {
                    e.stopPropagation();
                    // O link do autor também usa essa mesma estrutura de URL
                    window.location.href = `../views/criacaoItem.html?tipo=${tipoPagina}&id=${item._id}`;
                };

                const botaoExcluir = document.createElement('button');
                botaoExcluir.innerHTML = "<i class='fas fa-trash-alt' style='font-size:24px'></i>";
                botaoExcluir.className = "underline underline-offset-1 w-10 h-10 p-2 bg-red-800 hover:bg-red-500 hover:text-white hover:animate-bump cursor-pointer font-roboto-mono text-md aspect-square transition-all duration-300 rounded-lg shadow-sm";

                botaoExcluir.onclick = async (e) => {
                    e.stopPropagation();
                    if(confirm("Deseja mesmo excluir esse item?\nEssa ação não pode ser desfeita."))
                        try {
                            await fetch(`${VERCEL_URL}${config.endpoint}/${item._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${estaLogado}` }
                            });
                            if (!response.ok) {
                                const erro = await response.json();
                                throw new Error(erro.message || 'Falha ao excluir');
                            }

                            alert(`Item removido com sucesso.`);
                            window.location.reload();
                        } catch (error) {
                            console.error(error);
                            alert(`Ocorreu um erro ao remover o item: ${error.message}`);
                        };
                    }

                divBotoes.appendChild(botaoEditar);
                divBotoes.appendChild(botaoExcluir);
                templateClone.querySelector('.relative').appendChild(divBotoes);
            };

            container.appendChild(templateClone)
        });
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
        container.innerHTML = `
        <div class="font-comfortaa">
            <p class="text-teal-800 text-2xl font-extrabold">Erro!</p>
            <p class="text-black text-md italic">Ocorreu um erro ao carregar os itens.</p>
        </div>`
    }
});