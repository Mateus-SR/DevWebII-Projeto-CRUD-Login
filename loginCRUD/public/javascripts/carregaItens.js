document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    // Nesse arquivo existem várias preparações para exibir os diferentes tipos de dados que temos no banco de dados

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    // Se não achamos nosso container, podemos parar por aqui

    // Em cada página, existe um atributo especifico dizendo qual tipo de dados haverá ali (ex: na pagina "hqs", existe tipoData="hqs")
    // Isso vai ser util para identificarmos aonde estamos e como trataremos os dados nessa pagina, sem depender de enviar essa informação por cookie, localStorage ou outra forma
    const tipoPagina = container.getAttribute('tipoData');


/*######################################
    Formatações

    Aqui são usadas várias "string literais" (``) para configurar HTML que sera "injetado" na página,
    de acordo com o que precisa ser exibido

######################################*/     
    // Função para adicionar um link para a página do autor
    // (Ex: Em certo item, exibe o nome do autor, e um link, seguindo a rota "router.get('/:id' ...)")
    const formatarAutorLink = (autorOuLista) => {
        if (!autorOuLista) return 'Desconhecido';

        const criarLink = (a) => `<a href="../views/autores.html?id=${a._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">${a.nome}</a>`;

        // Se houverem mais de um autor, precisamos tratar os dados
        if (Array.isArray(autorOuLista)) {
            // Se recebemos um array vazio, algo aconteceu no caminho...
            if (autorOuLista.length === 0) return 'Desconhecido';

            // ... mas caso tudo venha nos conformes, apenas separamos os nomes por virgula
            // (o map() passa por cada item do array, criando um link e então colocando a virgula)
            return autorOuLista.map(criarLink).join(', ');
        }

        // (observação: se não for um array, caímos direto aqui)
        return criarLink(autorOuLista);
    };

    // Mesma coisa da rota de cima, mas com uma leve mudança no link
    const formatarArtistaLink = (artistaOuLista) => {
        if (!artistaOuLista) return 'Desconhecido';

        const criarLink = (a) => `<a href="../views/artista.html?id=${a._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">${a.nome}</a>`;

        // Se houverem mais de um artista, precisamos tratar os dados
        if (Array.isArray(artistaOuLista)) {
            // Se recebemos um array vazio, algo aconteceu no caminho...
            if (artistaOuLista.length === 0) return 'Desconhecido';

            // ... mas caso tudo venha nos conformes, apenas separamos os nomes por virgula
            // (o map() passa por cada item do array, criando um link e então colocando a virgula)
            return artistaOuLista.map(criarLink).join(', ');
        }

        // (observação: se não for um array, caímos direto aqui)
        return criarLink(artistaOuLista);
    };

    // Na seção dos autores/artistas/bandas, são listadas as obras que cada um tem seu nome, com um link
    // (Ex: Em certo autor, exibe o nome das obras, e um link, seguindo a rota "router.get('/:id' ...)")
    const formatarObraLink = (lista, nomeTipo, paginaHtml) => {
        /*
        lista = é a lista de obras
        nomeTipo = qual tipo de obra ela é
        paginaHtml = para qual pagina redirecionar (ex: se é cd, vai pro html do cd, etc)
        */

        if (!lista || lista.length === 0) return []; // Se não tiver lista ou ela estiver vazia, retorna um array vazio

        // Na lista de obras, o map() passa em cada item, criando o link
        return lista.map(obra =>
            // obra.id serve para a rota get/:id que mencionei ali em cima
            `<li>
                <a href="../views/${paginaHtml}?id=${obra._id}" class="underline underline-offset-1 hover:text-teal-500 hover:font-bold transition-all">
                    ${obra.nome || obra.titulo}
                </a> 
                <span class="text-xs opacity-75 font-semibold">(${nomeTipo})</span>
            </li>`
        );
    };

    // Formatação para a lista de obras
    const formatarListaDetalhes = (lista, tituloLista) => {
        if (!lista || lista.length === 0) return ''; // Se não tiver lista ou ela estiver vazia, retorna um string vazio

        // Criando a base
        let html = `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-32 overflow-y-auto text-sm border whitespace-pre-line border-teal-600/30">`;
        html += `<p class="font-bold text-xs uppercase mb-1 opacity-70">${tituloLista}:</p>`;

        // Passando em cada item para formatar eles
        lista.forEach((item, index) => {
            let texto = '';
            if (tituloLista === 'Volumes') {
                texto = `Vol. ${item.volume}: ${item.titulo || ''} ${!item.emEstoque ? '(Sem Estoque)' : ''}`;
            } else if (tituloLista === 'Faixas') {
                texto = `${index + 1}. ${item.titulo} <span class="opacity-60 text-xs">(${item.duracao || '--:--'})</span>`;
            }
            html += `${texto}\n`;
        });

        // Fechando o html
        html += `</div>`;
        return html; // E devolvendo ele, para ser impresso na tela
    };


/*######################################
    Configurações

    Nessa parte, são configurados os dados a serem exibidos, pois precisamos resgatar os dados do banco
    (observação: https://github.com/Mateus-SR/Sistema-Monitoramento-Linhas-Onibus/blob/main/server.js
    é praticamente a mesma coisa de como o site dos onibus interage com a API da Sptrans e filtra os dados que vamos exibir na tela:
    Temos um objeto, e extraimos os dados que queremos. Aqui, essa é a estrutura do que queremos)

    Um detalhe importante é o campo "endpoint" que é criado nesse objeto gigante. Ele serve para que a página saiba aonde pedir
    (para o vercel) as informações que estaremos pedindo

    endpoint = "/hqs" significa que, depois, o vercel vai fazer esse caminho:
    https://dev-web-ii-projeto-crud-login.vercel.app/hqs, a partir daqui, usar as rotas que estão em hqs

######################################*/
    const configuracoes = {
        'hqs': {
            endpoint: '/hqs',
            getDescricao: (item) => {
                const generos = item.genero && item.genero.length > 0 ? item.genero.join(', ') : 'N/A';
                const linksAutores = formatarAutorLink(item.autores);
                const listaVolumes = formatarListaDetalhes(item.volumes, 'Volumes');

                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';

                return `<strong>Tipo:</strong> ${item.tipo}<br>
                        <strong>Gênero:</strong> ${generos}<br>
                        <strong>Autores:</strong> ${linksAutores}<br>
                        <strong>Total:</strong> ${item.volumeTotal || 0} volumes
                        ${listaVolumes}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.nome,
            getTituloAlt: (item) => {
                if (!item.nomeAlt || item.nomeAlt.length === 0) return '';
                // Essa parte serve para "limpar" o array de nomes alternativos, porque na hora de exibir, ele não reconhecia como varios nomes, daí tudo ficava junto
                // flatMap() aqui funciona de forma parecida com o map(), mas ele limpa o array de valores nulos e garante que tudo aqui é um unico array, só então roda a função pra cada um dos itens que sobram (resumindo: nulos são descartados, varios arrays se tornam só um)
                const nomesLimpos = item.nomeAlt.flatMap(nome => {
                    // A lógica aqui é: se o nome que recebemos for mesmo uma string, tirando os espaços no começo e no fim, e começar com [ ou ], então transformamos em um array válido para ser lido como json
                    if (typeof nome === 'string' && nome.trim().startsWith('[') && nome.trim().endsWith(']')) { 
                        // Transforma a string '["A","B"]' no array ["A","B"]

                        try {
                            return JSON.parse(nome);
                        } catch (e) {
                            return nome; // Se falhar, pode mandar do jeito que está
                        }
                    }
                    return nome;
                });
                return nomesLimpos.join('\n');
// https://www.reddit.com/r/swift/comments/6pomr8/trying_to_wrap_my_head_around_map_vs_flat_mapand link util sobre map, flat e flatMap

            }
        },
        'livros': {
            endpoint: '/livros',
            getDescricao: (item) => {
                const generos = item.genero && item.genero.length > 0 ? item.genero.join(', ') : 'N/A';
                const linksAutores = formatarAutorLink(item.autores);

                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';                

                return `<strong>Ano:</strong> ${item.ano || 'N/A'}<br>
                        <strong>Gênero:</strong> ${generos}<br>
                        <strong>Autores:</strong> ${linksAutores}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.nome
        },
        'cds': {
            endpoint: '/cds',
            getDescricao: (item) => {
                const linkArtista = formatarArtistaLink(item.autor);
                const listaFaixas = formatarListaDetalhes(item.faixas, 'Faixas');

                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';

                const generos = item.genero && item.genero.length > 0 ? item.genero.join(', ') : 'N/A';

                return `<strong>Artista:</strong> ${linkArtista}<br>
                        <strong>Gênero:</strong> ${generos}<br> <strong>Ano:</strong> ${item.ano || 'N/A'}<br>
                        <strong>Total de faixas:</strong> ${item.faixasTotal || 0}
                        ${listaFaixas}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.titulo
        },
        'dvds': {
            endpoint: '/dvds',
            getDescricao: (item) => {
                const linkDiretor = formatarAutorLink(item.autor);

                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';

                const linkDiretores = formatarAutorLink(item.autores);
                return `<strong>Autores, Diretores e/ou Roteiristas:</strong> ${linkDiretores}<br>
                        <strong>Duração:</strong> ${item.duracao || '--'} min<br>
                        <strong>Ano:</strong> ${item.ano || 'N/A'}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.nome
        },
        'autores': {
            endpoint: '/autores',
            getDescricao: (item) => {
                // criamos um array para guardar os links
                let linksObras = [];
                
                // Passando os dados pra função de formatar la em cima
                // (como podem ser vários links, usamos "... para quebrar os vários links, e adicionar (push) cada um individualmente no array)
                // (jogamos todos os itens/links de uma vez na função em uma "caixa", depois abrimos ela e colocamos um a um no array linksObras)
                linksObras.push(...formatarObraLink(item.livros, 'Livro', 'livros.html'));
                linksObras.push(...formatarObraLink(item.hqs, 'HQ', 'hqs.html'));
                linksObras.push(...formatarObraLink(item.dvds, 'DVD', 'dvds.html'));

                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';

                /* listaHtml recebe um html especifico dependendo se linksObras estiver vazio ou não
                 (essa é a sintaxe diferente do if, que eu chamo "if de uma linha só":
                    [algo] [condicao] ? [o que fazer se for true] : [o que fazer se for falso])
                */
                const listaHtml = linksObras.length > 0 
                    ? `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-40 overflow-y-auto text-sm border border-teal-600/30">
                         <ul class="list-disc pl-4 space-y-1">${linksObras.join('')}</ul>
                       </div>`
                    : '<span class="italic opacity-70">Nenhuma obra cadastrada.</span>';

                return `<strong>Nacionalidade:</strong> ${item.nacionalidade || 'N/A'}<br>
                        <strong>Obras:</strong><br> ${listaHtml}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.nome
        }, 
        'artistas': { 
            endpoint: '/artistas',
            getDescricao: (item) => {
                // criamos um array para guardar os links
                let linksObras = [];
                
                const usuarioAdd = item.adicionadoPor ? item.adicionadoPor.username : 'Desconhecido';
                const usuarioAlt = item.alteradoPor ? item.alteradoPor.username : 'Desconhecido';

                // Passando os dados pra função de formatar la em cima
                // (como podem ser vários links, usamos "... para quebrar os vários links, e adicionar (push) cada um individualmente no array)
                // (jogamos todos os itens/links de uma vez na função em uma "caixa", depois abrimos ela e colocamos um a um no array linksObras)
                linksObras.push(...formatarObraLink(item.cds, 'CD', 'cds.html'));
                linksObras.push(...formatarObraLink(item.dvds, 'DVD', 'dvds.html'));

                /* listaHtml recebe um html especifico dependendo se linksObras estiver vazio ou não
                (essa é a sintaxe diferente do if, que eu chamo "if de uma linha só":
                   [algo] [condicao] ? [o que fazer se for true] : [o que fazer se for falso])
               */
                const listaHtml = linksObras.length > 0 
                    ? `<div class="mt-2 p-2 bg-teal-800/30 rounded max-h-40 overflow-y-auto text-sm border border-teal-600/30">
                         <ul class="list-disc pl-4 space-y-1">${linksObras.join('')}</ul>
                       </div>`
                    : '<span class="italic opacity-70">Nenhuma obra cadastrada.</span>';

                return `<strong>Nacionalidade:</strong> ${item.nacionalidade || 'N/A'}<br>
                        <strong>Obras:</strong><br> ${listaHtml}
                        <span class="text-md text-gray-800 block mt-2">
                        Adicionado por: ${usuarioAdd} - Última atualização por: ${usuarioAlt}
                         </span>`;
            },
            getTitulo: (item) => item.nome
        }
    };

    /* Aqui, pegamos no nosso "objetão" a configuração que nosso html disse com tipoData
    (se a página é "livros", temos tipoData="livros", logo, aqui vamos pegar a seção "livros" dentro de configuracoes:
        "const config = configuracoes[livros]")*/
    const config = configuracoes[tipoPagina]
    if (!config) {
        console.warn("Tipo de página desconhecido:", tipoPagina)
        return;
    }

/*######################################

######################################*/
    try {
        // URLSearchParams serve para verificar os parametros que podem ser colocados na url, como quando você pesquisa algo em um site e aparece na url algo como "search?search=alguma+coisa"
        const urlParams = new URLSearchParams(window.location.search);
        const paramId = urlParams.get('id');

        // configurando que, pra essa requisição, vamos mandar o vercel (link do vercel) buscar na rota de mesmo nome do endpoint
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

        // Verificação para garantir que temos dados para tratar...
        if (itens.length === 0) {
            container.innerHTML = '<p class="text-center text-white text-xl font-bold mt-10">Nenhum item encontrado.</p>';
            return;
        }

        // ... e em cada um deles, aplicar esse tratamento/formatação
        /* Aqui, estamos configurando o html, com base no <template> que existe em cada pagina. Esse template funciona quase como
        uma template string (``), só que mais profissional e menos gambiarra

        Esse <template> acaba copiando e guardando (mas não exibindo) os dados que estão no divItem.html, arquivo do Jekyll.
        É provavelmente a melhor forma de se criar uma página dessas, que precisa do mesmo elemento várias vezes na pagina
        */
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
                    tituloAlt.textContent = alt;
                } else {
                    tituloAlt.remove();
                }
            } else {
                tituloAlt.remove();
            }

            // Renderiza o HTML (links, listas, negrito)
            descricao.innerHTML = config.getDescricao(item);

            if (item.urlFoto) {
                // Se temos uma foto, pode usar ela (resgatar sua url)...
                img.src = item.urlFoto;
            } else {
                // ... mas caso não tenha, use a imagem padrão/placeholder
                img.src = '../public/images/imgN-A.png'
            }
            img.alt = config.getTitulo(item);

            const estaLogado = localStorage.getItem('jwt_token');
            if (estaLogado) {
                // Verificação para garantir que estamos logados e só assim podemos ter acesso à parte de edição e remoção de um item
                // Aqui criamos também os botões de edição e remoção
                const divBotoes = document.createElement('div');
                divBotoes.className = "absolute top-5 md:bottom-5 right-5 mx-auto flex flex-col-reverse md:flex-row gap-5 md:text-md text-sm";

                const botaoEditar = document.createElement('button');
                botaoEditar.innerHTML = "<i class='fas fa-edit' style='font-size:24px'></i>";
                botaoEditar.className = "underline underline-offset-1 w-10 h-10 p-2 bg-teal-800 hover:bg-teal-500 hover:text-white hover:animate-bump cursor-pointer font-roboto-mono text-md aspect-square transition-all duration-300 rounded-lg shadow-sm";

                botaoEditar.onclick = (e) => {
                    e.stopPropagation();
                    // Para editar, continua indo para a página de criação com o ID
                    // Lá, os dados serão resgatados e preparados para edição rápida (mandamos apenas o id, o resto, a outra pagina se vira)
                    window.location.href = `../views/criacaoItem.html?tipo=${tipoPagina}&id=${item._id}`;
                };

                const botaoExcluir = document.createElement('button');
                botaoExcluir.innerHTML = "<i class='fas fa-trash-alt' style='font-size:24px'></i>";
                botaoExcluir.className = "underline underline-offset-1 w-10 h-10 p-2 bg-red-800 hover:bg-red-500 hover:text-white hover:animate-bump cursor-pointer font-roboto-mono text-md aspect-square transition-all duration-300 rounded-lg shadow-sm";

                botaoExcluir.onclick = async (e) => {
                    e.stopPropagation();
                    if (confirm("Deseja mesmo excluir esse item?\nEssa ação não pode ser desfeita."))
                        try {
                    // chamando no vercel a rota de delete (remoção), com base no endpoint la de antes, e o id da entrada atual
                            await fetch(`${VERCEL_URL}${config.endpoint}/${item._id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${estaLogado}`
                                }
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

                // Aplica os botões no clone do <template>...
                divBotoes.appendChild(botaoEditar);
                divBotoes.appendChild(botaoExcluir);
                templateClone.querySelector('.relative').appendChild(divBotoes);
            };

            //... e finalmente aplica o template na tela (faz esse processo todo para cada entrada no banco de dados que encontrar e estiver ativa)
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