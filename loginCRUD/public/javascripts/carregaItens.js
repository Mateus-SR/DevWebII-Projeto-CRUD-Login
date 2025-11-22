document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    const tipoPagina = container.getAttribute('tipoData');

    // --- Funções Auxiliares de Formatação ---

    // 1. Cria link para a visualização do Autor (autores.html?id=...)
    const formatarAutorLink = (autorOuLista) => {
        if (!autorOuLista) return 'Desconhecido';
        
        // Mudança: aponta para autores.html com ID, em vez de criacaoItem.html
        const criarLink = (a) => `<a href="../views/autores.html?id=${a._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">${a.nome}</a>`;

        if (Array.isArray(autorOuLista)) {
            if (autorOuLista.length === 0) return 'Desconhecido';
            return autorOuLista.map(criarLink).join(', ');
        }
        return criarLink(autorOuLista);
    };

    const formatarArtistaLink = (artistaOuLista) => {
        if (!artistaOuLista) return 'Desconhecido';
        
        // Mudança: aponta para autores.html com ID, em vez de criacaoItem.html
        const criarLink = (a) => `<a href="../views/artista.html?id=${a._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">${a.nome}</a>`;

        if (Array.isArray(artistaOuLista)) {
            if (artistaOuLista.length === 0) return 'Desconhecido';
            return artistaOuLista.map(criarLink).join(', ');
        }
        return criarLink(artistaOuLista);
    };

    // 2. Cria link para as Obras do Autor (livros.html?id=...)
    const formatarObraLink = (lista, nomeTipo, paginaHtml) => {
        if (!lista || lista.length === 0) return [];
        
        // Gera: <a href="...">Titulo</a> (Tipo)
        return lista.map(obra => 
            `<li>
                <a href="../views/${paginaHtml}?id=${obra._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">
                    ${obra.nome || obra.titulo}
                </a> 
                <span class="text-xs opacity-75 font-semibold">(${nomeTipo})</span>
            </li>`
        );
    };

    // 3. Formata listas genéricas (Volumes/Faixas) com scroll
    const formatarListaDetalhes = (lista, tituloLista) => {
        if (!lista || lista.length === 0) return '';
        
        let html = `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-32 overflow-y-auto text-sm border border-teal-600/30">`;
        html += `<p class="font-bold text-xs uppercase mb-1 opacity-70">${tituloLista}:</p><ul class="list-disc pl-4 space-y-1">`;
        
        lista.forEach((item, index) => {
            let texto = '';
            if (tituloLista === 'Volumes') {
                texto = `Vol. ${item.volume}: ${item.titulo || ''} ${!item.emEstoque ? '(Sem Estoque)' : ''}`;
            } else if (tituloLista === 'Faixas') {
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
                const listaVolumes = formatarListaDetalhes(item.volumes, 'Volumes');

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
                const linkArtista = formatarArtistaLink(item.autor);
                const listaFaixas = formatarListaDetalhes(item.faixas, 'Faixas');

                return `<strong>Artista:</strong> ${linkArtista}<br>
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
                // Coleta e formata todas as obras com links
                let linksObras = [];
                
                // Usa a função auxiliar para cada tipo de obra populada
                linksObras.push(...formatarObraLink(item.livros, 'Livro', 'livros.html'));
                linksObras.push(...formatarObraLink(item.hqs, 'HQ', 'hqs.html'));
                linksObras.push(...formatarObraLink(item.cds, 'CD', 'cds.html'));
                linksObras.push(...formatarObraLink(item.dvds, 'DVD', 'dvds.html'));

                const listaHtml = linksObras.length > 0 
                    ? `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-40 overflow-y-auto text-sm border border-teal-600/30">
                         <ul class="list-disc pl-4 space-y-1">${linksObras.join('')}</ul>
                       </div>`
                    : '<span class="italic opacity-70">Nenhuma obra cadastrada.</span>';

                return `<strong>Nacionalidade:</strong> ${item.nacionalidade || 'N/A'}<br>
                        <strong>Obras:</strong><br> ${listaHtml}`;
            },
            getTitulo: (item) => item.nome
        },
            endpoint: '/autores',
            getDescricao: (item) => {
                // Coleta e formata todas as obras com links
                let linksObras = [];
                
                linksObras.push(...formatarObraLink(item.cds, 'CD', 'cds.html'));

                const listaHtml = linksObras.length > 0 
                    ? `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-40 overflow-y-auto text-sm border border-teal-600/30">
                         <ul class="list-disc pl-4 space-y-1">${linksObras.join('')}</ul>
                       </div>`
                    : '<span class="italic opacity-70">Nenhuma obra cadastrada.</span>';

                return `<strong>Nacionalidade:</strong> ${item.nacionalidade || 'N/A'}<br>
                        <strong>Obras:</strong><br> ${listaHtml}`;
            },
            getTitulo: (item) => item.nome
    };

    const config = configuracoes[tipoPagina]
    if(!config) {
        console.warn("Tipo de página desconhecido:", tipoPagina)
        return;
    }

    try {
        // --- NOVA LÓGICA DE FETCH (ID ou Todos) ---
        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('id');
        
        let url = `${VERCEL_URL}${config.endpoint}`;
        
        // Se tiver ID na URL, busca só aquele item específico (Rota GET /:id)
        if (paramId) {
            url += `/${paramId}`;
        }

        const response = await fetch(url);
        const dados = await response.json();

        // Se buscou por ID, o retorno é um Objeto único. Se buscou todos, é um Array.
        // Normalizamos para sempre ser um array para o forEach funcionar.
        const itens = Array.isArray(dados) ? dados : [dados];

        container.innerHTML = '';

        if (itens.length === 0) {
            container.innerHTML = '<p class="text-center text-white text-xl font-bold mt-10">Nenhum item encontrado.</p>';
            return;
        }

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

            // Renderiza o HTML (links, listas, negrito)
            descricao.innerHTML = config.getDescricao(item);

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
                    // Para editar, continua indo para a página de criação com o ID
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
                                // Tenta ler erro da API, se houver
                                const erro = await response.json().catch(() => ({})); 
                                throw new Error(erro.message || 'Falha ao excluir');
                            }

                            alert(`Item removido com sucesso.`);
                            // Se estiver na página de detalhe (com ID), volta para a lista geral
                            if (paramId) {
                                window.location.href = `${tipoPagina}.html`;
                            } else {
                                window.location.reload();
                            }
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
        <div class="font-comfortaa mx-auto text-center mt-10 p-5 bg-teal-50 rounded shadow">
            <p class="text-teal-800 text-2xl font-extrabold">Erro!</p>
            <p class="text-black text-md italic">Ocorreu um erro ao carregar os itens.</p>
            <p class="text-xs text-gray-500 mt-2">${error.message}</p>
        </div>`
    }
});