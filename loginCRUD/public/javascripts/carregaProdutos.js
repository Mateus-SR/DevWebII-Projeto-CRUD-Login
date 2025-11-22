document.addEventListener('DOMContentLoaded', async () => {

    const VERCEL_URL = "https://dev-web-ii-projeto-crud-login.vercel.app";

    const container = document.getElementById('listaItem');
    const template = document.getElementById('templateDiv');

    if (!container) return;
    const tipoPagina = container.getAttribute('tipoData');

    const configuracoes = {
        'hqs': { // para fazer: adicionar os demais campos do banco de dados
            endpoint: '/hqs',
            getDescricao: (item) => `Tipo: ${item.tipo}\nGênero: ${item.genero ? item.genero.join(', ') : 'N/A'}`,
            getTitulo: (item) => item.nome,
            getTituloAlt: (item) => {
                if (!item.nomeAlt || item.nomeAlt.length === 0) return '';

                // Essa parte serve para "limpar" o array de nomes alternativos, porque na hora de exibir, ele não reconhecia como varios nomes, daí tudo ficava junto
                // flatMap() aqui funciona de forma parecida com o map(), mas ele limpa o array de valores nulos e garante que tudo aqui é um unico array, só então roda a função pra cada um dos itens que sobram (resumindo: nulos são descartados, varios arrays se tornam só um)
                const nomesLimpos = item.nomeAlt.flatMap(nome => {
                    // A lógica aqui é: se o nome que recebemos for mesmo uma string, tirando os espaços no começo e no fim, e começar com [ ou ], então transformamos em um array válido para ser lido como json
                    if (typeof nome === 'string' && nome.trim().startsWith('[') && nome.trim().endsWith(']')) {
                        try {
                            return JSON.parse(nome); // Transforma a string '["A","B"]' no array ["A","B"]
                        } catch (e) {
                            return nome; // Se falhar, pode mandar do jeito que está
                        }
                    }
                    return nome;
// https://www.reddit.com/r/swift/comments/6pomr8/trying_to_wrap_my_head_around_map_vs_flat_mapand link util
                });

                return nomesLimpos.join('\n');
            }
        },
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
        container.innerHTML = `        <div class="font-comfortaa">
        <p class="text-teal-800 text-2xl font-extrabold">Erro!</p>
        <p class="text-black text-md italic">Ocorreu um erro ao carregar os itens.</p>
    </div>`
    }
});