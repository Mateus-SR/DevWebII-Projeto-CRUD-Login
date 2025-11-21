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
            campos: [
                { id: 'nome', label: 'Nome da HQ', type: 'text', required: true },
                { id: 'tipo', label: 'Tipo', type: 'tipo-hq', required: true },
                { id: 'genero', label: 'Gêneros', type: 'text', transform: 'array' },
                { id: 'autores', label: 'Autores', type: 'autor-search', multiple: true, required: true },
                { id: 'imagem', label: 'Upload da Capa (opcional)', type: 'file' }
            ]
        },
        'livros': {
            endpoint: '/livros',
            campos: [
                { id: 'nome', label: 'Título', type: 'text', required: true },
                { id: 'ano', label: 'Ano', type: 'number' },
                { id: 'genero', label: 'Gêneros', type: 'text', transform: 'array' },
                { id: 'autores', label: 'Autores', type: 'autor-search', multiple: true, required: true },
                { id: 'imagem', label: 'Upload da Capa (opcional)', type: 'file' }
            ]
        },
        'cds': {
            endpoint: '/cds',
            campos: [
                { id: 'titulo', label: 'Título', type: 'text', required: true },
                { id: 'tipo', label: 'Tipo', type: 'text', required: true },
                { id: 'ano', label: 'Ano', type: 'number' },
                { id: 'autor', label: 'Artista', type: 'autor-search', required: true },
                { id: 'imagem', label: 'Upload da Capa (opcional)', type: 'file' }
            ]
        },
        'dvds': {
            endpoint: '/dvds',
            campos: [
                { id: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'tipo', label: 'Tipo', type: 'text', required: true },
                { id: 'duracao', label: 'Duração (min)', type: 'number' },
                { id: 'ano', label: 'Ano', type: 'number' },
                { id: 'autor', label: 'Diretor', type: 'autor-search', required: true },
                { id: 'imagem', label: 'Upload da Capa (opcional)', type: 'file' }
            ]
        },
        'autores': {
            endpoint: '/autores',
            campos: [
                { id: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'nacionalidade', label: 'Nacionalidade', type: 'text' },
                { id: 'imagem', label: 'Upload da Foto (opcional)', type: 'file' }
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
                                        selecionados.push({ id: autor._id, nome: autor.nome });
                                        inputVisual.value = '';
                                        inputVisual.focus();
                                    } else {
                                        selecionados = [{ id: autor._id, nome: autor.nome }];
                                        inputVisual.value = autor.nome;
                                        listaUl.classList.add('hidden');
                                    }
                                    atualizarInputOculto();
                                    renderTags();
                                    if(campo.multiple) filtrar('');
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
            } 
            else if (campo.type === 'autor-search') {
               // ... (validação de autor vazia igual antes) ...
               let valorOculto = input.value;
               
               // O Multer recebe strings. Se for array (multiple), mandamos como JSON string
               // O valorOculto já é uma string JSON "[id1, id2]" vinda da lógica anterior
               formData.append(campo.id, valorOculto);
            } 
            else {
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