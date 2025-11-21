let listaAutores = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = 'login.html';
        return;
    }

    const seletor = document.getElementById('seletorTipo');
    const form = document.getElementById('formDinamico');
    const container = document.getElementById('camposContainer');

    seletor.disabled = true;
    const opcaoPadrao = seletor.options[0];
    opcaoPadrao.text = "Carregando autores...";

    try {
        const response = await fetch(`${VERCEL_URL}/autores`);
        const dados = await response.json();
        if (Array.isArray(dados)) {
            listaAutores = dados;
            seletor.disabled = false;
            opcaoPadrao.text = "Selecione uma categoria...";
        }
    } catch (error) {
        console.error("Erro ao carregar autores:", error);
        opcaoPadrao.text = "Erro de conexão";
    }

    const schemas = {
        'hqs': {
            endpoint: '/hqs',
            campos: [{
                    id: 'nome',
                    label: 'Nome da HQ',
                    type: 'text',
                    required: true
                },
                {
                    id: 'nomeAlt',
                    label: 'Nomes alternativos (separar por vírgula)',
                    type: 'text',
                    transform: 'array'
                },
                {
                    id: 'tipo',
                    label: 'Tipo',
                    type: 'tipo-hq',
                    required: true
                },
                {
                    id: 'genero',
                    label: 'Gêneros',
                    type: 'text',
                    transform: 'array'
                },
                {
                    id: 'autores',
                    label: 'Autores',
                    type: 'autor-search',
                    multiple: true,
                    required: true
                },
                {
                    id: 'volumes',
                    label: 'Lista de Volumes',
                    type: 'volumes-list'
                },
                {
                    id: 'imagem',
                    label: 'Upload da Capa',
                    type: 'file'
                }
            ]
        },
        'livros': {
            endpoint: '/livros',
            campos: [{
                    id: 'nome',
                    label: 'Título',
                    type: 'text',
                    required: true
                },
                {
                    id: 'ano',
                    label: 'Ano',
                    type: 'number'
                },
                {
                    id: 'genero',
                    label: 'Gêneros',
                    type: 'text',
                    transform: 'array'
                },
                {
                    id: 'autores',
                    label: 'Autores',
                    type: 'autor-search',
                    multiple: true,
                    required: true
                },
                {
                    id: 'imagem',
                    label: 'Upload da Capa (opcional)',
                    type: 'file'
                }
            ]
        },
        'cds': {
            endpoint: '/cds',
            campos: [{
                    id: 'titulo',
                    label: 'Título do Álbum',
                    type: 'text',
                    required: true
                },
                {
                    id: 'tipo',
                    label: 'Tipo (Álbum, EP, Single)',
                    type: 'text',
                    required: true
                },
                {
                    id: 'genero',
                    label: 'Gênero Musical',
                    type: 'text'
                },
                {
                    id: 'ano',
                    label: 'Ano',
                    type: 'number'
                },
                {
                    id: 'duracaoTotal',
                    label: 'Duração Total (minutos)',
                    type: 'number'
                },
                {
                    id: 'autor',
                    label: 'Artista/Banda',
                    type: 'autor-search',
                    required: true
                },
                {
                    id: 'faixas',
                    label: 'Lista de Faixas',
                    type: 'faixas-list'
                },
                {
                    id: 'imagem',
                    label: 'Upload da Capa',
                    type: 'file'
                }
            ]
        },
        'dvds': {
            endpoint: '/dvds',
            campos: [{
                    id: 'nome',
                    label: 'Nome',
                    type: 'text',
                    required: true
                },
                {
                    id: 'tipo',
                    label: 'Tipo',
                    type: 'text',
                    required: true
                },
                {
                    id: 'duracao',
                    label: 'Duração (min)',
                    type: 'number'
                },
                {
                    id: 'ano',
                    label: 'Ano',
                    type: 'number'
                },
                {
                    id: 'autor',
                    label: 'Diretor',
                    type: 'autor-search',
                    required: true
                },
                {
                    id: 'imagem',
                    label: 'Upload da Capa (opcional)',
                    type: 'file'
                }
            ]
        },
        'autores': {
            endpoint: '/autores',
            campos: [{
                    id: 'nome',
                    label: 'Nome',
                    type: 'text',
                    required: true
                },
                {
                    id: 'nacionalidade',
                    label: 'Nacionalidade',
                    type: 'text'
                },
                {
                    id: 'imagem',
                    label: 'Upload da Foto (opcional)',
                    type: 'file'
                }
            ]
        }
    };

    seletor.addEventListener('change', (e) => {
        const config = schemas[e.target.value];
        if (!config) return;

        container.innerHTML = '';
        form.classList.remove('hidden');


        config.campos.forEach(campo => {
            const divWrapper = document.createElement('div');
            divWrapper.className = "relative mb-4";


            if (campo.type === 'autor-search') {
                let selecionados = [];

                divWrapper.innerHTML = `
                    <label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>
                    
                    <div id="tags-${campo.id}" class="flex flex-wrap gap-2 mb-2"></div>

                    <input type="text" id="${campo.id}-visual" 
                        class="w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa focus:ring-2 focus:ring-teal-400 outline-none"
                        placeholder="${campo.multiple ? 'Digite para adicionar autores...' : 'Digite para buscar...'}"
                        autocomplete="off">
                    
                    <input type="hidden" id="${campo.id}">

                    <ul id="lista-${campo.id}" class="hidden absolute w-full bg-white border border-gray-300 rounded-b-lg shadow-2xl max-h-60 overflow-y-auto z-50 mt-1"></ul>
                `;

                setTimeout(() => {
                    const inputVisual = document.getElementById(`${campo.id}-visual`);
                    const inputOculto = document.getElementById(campo.id);
                    const listaUl = document.getElementById(`lista-${campo.id}`);
                    const tagsContainer = document.getElementById(`tags-${campo.id}`);

                    function renderTags() {
                        tagsContainer.innerHTML = '';
                        selecionados.forEach((item, index) => {
                            const tag = document.createElement('span');
                            tag.className = "bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2";
                            tag.innerHTML = `
                                ${item.nome}
                                <button type="button" class="text-teal-600 hover:text-red-500 font-bold">×</button>
                            `;
                            tag.querySelector('button').onclick = () => {
                                selecionados.splice(index, 1);
                                atualizarInputOculto();
                                renderTags();
                            };
                            tagsContainer.appendChild(tag);
                        });
                    }

                    function atualizarInputOculto() {
                        if (campo.multiple) {
                            inputOculto.value = JSON.stringify(selecionados.map(s => s.id));
                        } else {
                            inputOculto.value = selecionados.length > 0 ? selecionados[0].id : '';
                        }
                    }

                    function filtrar(texto) {
                        listaUl.innerHTML = '';
                        const termo = texto.toLowerCase();

                        const filtrados = listaAutores.filter(autor =>
                            autor.nome.toLowerCase().includes(termo) &&
                            !selecionados.some(sel => sel.id === autor._id)
                        );

                        if (filtrados.length === 0) {
                            listaUl.innerHTML = `<li class="p-3 text-gray-500 italic">Nada encontrado.</li>`;
                        } else {
                            filtrados.forEach(autor => {
                                const li = document.createElement('li');
                                li.className = "p-3 hover:bg-teal-100 cursor-pointer border-b border-gray-100 font-comfortaa text-sm";
                                li.textContent = autor.nome;

                                li.onclick = () => {
                                    if (campo.multiple) {
                                        selecionados.push({
                                            id: autor._id,
                                            nome: autor.nome
                                        });
                                        inputVisual.value = '';
                                        inputVisual.focus();
                                    } else {
                                        selecionados = [{
                                            id: autor._id,
                                            nome: autor.nome
                                        }];
                                        inputVisual.value = autor.nome;
                                        listaUl.classList.add('hidden');
                                    }
                                    atualizarInputOculto();
                                    renderTags();
                                    if (campo.multiple) filtrar('');
                                };
                                listaUl.appendChild(li);
                            });
                        }
                        listaUl.classList.remove('hidden');
                    }

                    inputVisual.addEventListener('input', (e) => filtrar(e.target.value));
                    inputVisual.addEventListener('focus', () => filtrar(inputVisual.value));

                    document.addEventListener('click', (e) => {
                        if (!divWrapper.contains(e.target)) listaUl.classList.add('hidden');
                    });
                }, 0);

            } else if (campo.type === 'tipo-hq') {
                divWrapper.innerHTML = `
                    <label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>
                    <select id="${campo.id}" ${campo.required ? 'required' : ''} 
                        class="w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa focus:ring-2 focus:ring-teal-400 outline-none bg-white">
                        <option value="" disabled selected>Selecione...</option>
                        <option value="HQ">HQ</option>
                        <option value="Mangá">Mangá</option>
                        <option value="Gibi">Gibi</option>
                        <option value="Graphic Novel">Graphic Novel</option>
                    </select>
                `;
            } else if (campo.type === 'faixas-list') {
                divWrapper.innerHTML = `
                        <label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                        
                        <div id="container-${campo.id}" class="flex flex-col gap-2 mb-3"></div>
    
                        <button type="button" id="btn-add-${campo.id}" 
                            class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition w-full md:w-auto">
                            + Adicionar Faixa
                        </button>
                    `;

                setTimeout(() => {
                    const btnAdd = document.getElementById(`btn-add-${campo.id}`);
                    const containerFaixas = document.getElementById(`container-${campo.id}`);

                    // Função para numeração correta (1, 2, 3...)
                    const atualizarIndices = () => {
                        containerFaixas.querySelectorAll('.faixa-index').forEach((span, i) => span.textContent = i + 1);
                    };

                    const adicionarFaixa = () => {
                        const row = document.createElement('div');
                        row.className = "faixa-item bg-gray-50 p-2 rounded-lg border border-gray-200 flex gap-2 items-center";

                        row.innerHTML = `
                                <span class="faixa-index font-bold text-gray-400 select-none w-6 text-center">#</span>
                                <input type="text" placeholder="Nome da Música" class="faixa-titulo flex-1 border border-gray-300 p-2 rounded font-comfortaa text-sm" required>
                                <input type="text" placeholder="Duração (ex: 3:45)" class="faixa-duracao w-24 md:w-32 border border-gray-300 p-2 rounded font-comfortaa text-sm">
                                <button type="button" class="text-red-400 hover:text-red-600 font-bold text-xl px-2" title="Remover">×</button>
                            `;

                        row.querySelector('button').onclick = () => {
                            row.remove();
                            atualizarIndices();
                        };

                        containerFaixas.appendChild(row);
                        atualizarIndices();
                    };

                    btnAdd.onclick = adicionarFaixa;
                    adicionarFaixa(); // Começa com 1 faixa

                }, 0);
            } else if (campo.type === 'file') {
                divWrapper.innerHTML = `
                    <label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>
                    <input 
                        type="file" 
                        id="${campo.id}" 
                        accept="image/*"
                        class="w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa bg-white"
                    >
                `;

            } else if (campo.type === 'volumes-list') {
                divWrapper.innerHTML = `
                        <label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                        
                        <div id="container-${campo.id}" class="flex flex-col gap-3 mb-3"></div>
    
                        <button type="button" id="btn-add-${campo.id}" 
                            class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition">
                            + Adicionar Volume
                        </button>
                    `;

                // Lógica para adicionar linhas de volume
                setTimeout(() => {
                    const btnAdd = document.getElementById(`btn-add-${campo.id}`);
                    const containerVols = document.getElementById(`container-${campo.id}`);

                    // Função que cria uma linha de formulário para 1 volume
                    const adicionarVolume = () => {
                        const row = document.createElement('div');
                        row.className = "volume-item bg-gray-50 p-3 rounded-lg border border-gray-200 relative grid grid-cols-1 md:grid-cols-2 gap-3";

                        row.innerHTML = `
                                <input type="text" placeholder="Título do Volume" class="vol-titulo w-full border border-gray-300 p-2 rounded font-comfortaa text-sm" required>
                                <input type="text" placeholder="Título Alternativo (opcional)" class="vol-titulo-alt w-full border border-gray-300 p-2 rounded font-comfortaa text-sm">
                                <div class="flex gap-3">
                                    <input type="number" placeholder="Nº Vol." class="vol-numero w-20 border border-gray-300 p-2 rounded font-comfortaa text-sm" required>
                                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                        <input type="checkbox" class="vol-estoque w-4 h-4 accent-teal-500" checked> Em Estoque
                                    </label>
                                </div>
                                
                                <button type="button" class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xl" title="Remover">×</button>
                            `;

                        // Lógica do botão remover (X)
                        row.querySelector('button').onclick = () => row.remove();

                        containerVols.appendChild(row);
                    };

                    btnAdd.onclick = adicionarVolume;

                    // Adiciona um volume inicial automaticamente para facilitar
                    adicionarVolume();

                }, 0);

            } else {
                divWrapper.innerHTML = `
                    <label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>
                    <input type="${campo.type}" id="${campo.id}" ${campo.required ? 'required' : ''}
                        class="w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa focus:ring-2 focus:ring-teal-400 outline-none">
                `;
            }
            container.appendChild(divWrapper);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = seletor.value;
        const config = schemas[tipo];

        // Usamos FormData em vez de objeto simples
        const formData = new FormData();

        for (const campo of config.campos) {
            const input = document.getElementById(campo.id);

            if (campo.type === 'file') {
                // Se tiver arquivo selecionado, adiciona
                if (input.files[0]) {
                    formData.append('imagem', input.files[0]);
                }
            } else if (campo.type === 'volumes-list') {
                const containerVols = document.getElementById(`container-${campo.id}`);
                const linhas = containerVols.querySelectorAll('.volume-item');
                let listaVolumes = [];

                linhas.forEach(linha => {
                    const titulo = linha.querySelector('.vol-titulo').value;
                    const tituloAlt = linha.querySelector('.vol-titulo-alt').value;
                    const volume = linha.querySelector('.vol-numero').value;
                    const estoque = linha.querySelector('.vol-estoque').checked;

                    // Só adiciona se tiver título e número (validação básica)
                    if (titulo && volume) {
                        listaVolumes.push({
                            titulo: titulo,
                            tituloAlt: tituloAlt,
                            volume: Number(volume),
                            emEstoque: estoque
                        });
                    }
                });

                // Transforma o Array em String JSON para o FormData enviar
                formData.append(campo.id, JSON.stringify(listaVolumes));
                continue; // Pula para o próximo campo do loop
            } else if (campo.type === 'autor-search') {
                // ... (validação de autor vazia igual antes) ...
                let valorOculto = input.value;

                // O Multer recebe strings. Se for array (multiple), mandamos como JSON string
                // O valorOculto já é uma string JSON "[id1, id2]" vinda da lógica anterior
                formData.append(campo.id, valorOculto);
            } else if (campo.type === 'faixas-list') {
                const containerFaixas = document.getElementById(`container-${campo.id}`);
                const linhas = containerFaixas.querySelectorAll('.faixa-item');
                let listaFaixas = [];

                linhas.forEach(linha => {
                    const titulo = linha.querySelector('.faixa-titulo').value;
                    const duracao = linha.querySelector('.faixa-duracao').value;

                    if (titulo) {
                        listaFaixas.push({ titulo: titulo, duracao: duracao });
                    }
                });

                // Envia como JSON string
                formData.append(campo.id, JSON.stringify(listaFaixas));
                continue;
            } else {
                let valor = input.value;
                // Tratamentos especiais
                if (campo.transform === 'array') {
                    // Transforma em array e DEPOIS em string JSON para o FormData
                    const arr = valor.split(',').map(s => s.trim()).filter(s => s);
                    formData.append(campo.id, JSON.stringify(arr));
                } else {
                    formData.append(campo.id, valor);
                }
            }
        }

        try {
            const response = await fetch(`${VERCEL_URL}${config.endpoint}`, {
                method: 'POST',
                headers: {
                    // NÃO coloque 'Content-Type': 'multipart/form-data'. 
                    // O fetch coloca automaticamente com o boundary correto.
                    'Authorization': `Bearer ${token}`
                },
                body: formData // Envia o FormData direto
            });

            const result = await response.json();
            if (response.ok) {
                alert("Item adicionado com sucesso!");
                seletor.value = "";
                form.classList.add('hidden');
            } else {
                alert(`Erro: ${result.error || result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão");
        }
    });
});