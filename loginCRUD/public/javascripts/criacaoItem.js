let listaAutores = [];
// Variáveis globais para controle de edição
let editMode = false;
let currentId = null;

// --- DEFINIÇÃO DOS SCHEMAS (Configuração dos Campos) ---
const getSchemas = () => ({
    'hqs': {
        endpoint: '/hqs',
        campos: [
            { id: 'nome', label: 'Nome da HQ', type: 'text', required: true },
            { id: 'nomeAlt', label: 'Nomes alternativos', type: 'text', transform: 'array' },
            { id: 'tipo', label: 'Tipo', type: 'tipo-hq', required: true },
            { id: 'genero', label: 'Gêneros', type: 'text', transform: 'array' },
            { id: 'autores', label: 'Autores', type: 'autor-search', multiple: true, required: true, transform: 'arrayId' },
            { id: 'volumes', label: 'Lista de Volumes', type: 'volumes-list' },
            { id: 'imagem', label: 'Upload da Capa', type: 'file' }
        ]
    },
    'livros': {
        endpoint: '/livros',
        campos: [
            { id: 'nome', label: 'Título', type: 'text', required: true },
            { id: 'ano', label: 'Ano', type: 'number' },
            { id: 'genero', label: 'Gêneros', type: 'text', transform: 'array' },
            { id: 'autores', label: 'Autores', type: 'autor-search', multiple: true, required: true, transform: 'arrayId' },
            { id: 'imagem', label: 'Upload da Capa (opcional)', type: 'file' }
        ]
    },
    'cds': {
        endpoint: '/cds',
        campos: [
            { id: 'titulo', label: 'Título do Álbum', type: 'text', required: true },
            { id: 'tipo', label: 'Tipo', type: 'text', required: true },
            { id: 'genero', label: 'Gênero Musical', type: 'text' },
            { id: 'ano', label: 'Ano', type: 'number' },
            { id: 'duracaoTotal', label: 'Duração Total (minutos)', type: 'number' },
            { id: 'autor', label: 'Artista/Banda', type: 'autor-search', required: true },
            { id: 'faixas', label: 'Lista de Faixas', type: 'faixas-list' },
            { id: 'imagem', label: 'Upload da Capa', type: 'file' }
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
});

// --- INICIALIZAÇÃO ---
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

    // 1. Carregar dados iniciais
    await carregarAutores(seletor);

    // --- NOVO: Verificar se estamos em modo de edição ---
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    const paramTipo = urlParams.get('tipo'); // Ex: 'hqs', 'livros'

    if (paramId && paramTipo) {
        editMode = true;
        currentId = paramId;
        
        // Ajustar título da página
        document.querySelector('h1').textContent = "Editar Item";
        document.getElementById('botaoSavar').value = "Atualizar item";

        // Selecionar o tipo correto no dropdown e renderizar
        seletor.value = paramTipo;
        seletor.disabled = true; // Trava a mudança de tipo na edição

        const schemas = getSchemas();
        const config = schemas[paramTipo];
        
        if (config) {
            renderizarFormulario(config, container, form);
            // Buscar dados do banco e preencher
            await carregarDadosEdicao(paramTipo, paramId, config);
        }
    }
    // ----------------------------------------------------

    // 2. Configurar Eventos Principais
    seletor.addEventListener('change', (e) => {
        const schemas = getSchemas();
        const config = schemas[e.target.value];
        if (config) {
            renderizarFormulario(config, container, form);
        }
    });

    form.addEventListener('submit', (e) => processarEnvio(e, seletor, token));
});

// --- FUNÇÕES AUXILIARES ---

async function carregarAutores(seletor) {
    seletor.disabled = true;
    const opcaoPadrao = seletor.options[0];
    opcaoPadrao.text = "Carregando autores...";

    try {
        const response = await fetch(`${VERCEL_URL}/autores`);
        const dados = await response.json();
        
        if (Array.isArray(dados)) {
            listaAutores = dados;
            // Só reabilita se não estiver em modo edição
            if (!editMode) seletor.disabled = false;
            opcaoPadrao.text = "Selecione uma categoria...";
            console.log(`✅ ${listaAutores.length} autores carregados.`);
        }
    } catch (error) {
        console.error("Erro ao carregar autores:", error);
        opcaoPadrao.text = "Erro de conexão (Autores)";
    }
}

// --- NOVO: Função para buscar dados e preencher formulário ---
async function carregarDadosEdicao(tipo, id, config) {
    try {
        const response = await fetch(`${VERCEL_URL}${config.endpoint}/${id}`);
        if (!response.ok) throw new Error('Item não encontrado');
        const item = await response.json();

        // Preencher campos simples e arrays
        config.campos.forEach(campo => {
            const element = document.getElementById(campo.id);
            
            // Pular campo de imagem (não preenchemos file input por segurança) e listas complexas
            if (campo.type === 'file') return;
            if (campo.type === 'volumes-list') return preencherVolumes(campo.id, item[campo.id]);
            if (campo.type === 'faixas-list') return preencherFaixas(campo.id, item[campo.id]);
            if (campo.type === 'autor-search') return preencherAutoresSearch(campo, item);

            if (element) {
                // Tratamento para arrays simples (ex: generos)
                if (campo.transform === 'array' && Array.isArray(item[campo.id])) {
                    element.value = item[campo.id].join(', ');
                } else {
                    element.value = item[campo.id] || '';
                }
            }
        });

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados para edição.");
        window.location.href = 'index.html';
    }
}
// -----------------------------------------------------------

function renderizarFormulario(config, container, form) {
    container.innerHTML = '';
    form.classList.remove('hidden');

    config.campos.forEach(campo => {
        const divWrapper = document.createElement('div');
        divWrapper.className = "relative mb-4";
        divWrapper.innerHTML = gerarHTMLCampo(campo);
        container.appendChild(divWrapper);
        setTimeout(() => configurarLogicaCampo(campo), 0);
    });
}

function gerarHTMLCampo(campo) {
    const label = `<label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>`;
    const inputBaseClass = "w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa focus:ring-2 focus:ring-teal-400 outline-none";

    switch (campo.type) {
        case 'autor-search':
            return `
                ${label}
                <div id="tags-${campo.id}" class="flex flex-wrap gap-2 mb-2"></div>
                <input type="text" id="${campo.id}-visual" class="${inputBaseClass}"
                    placeholder="${campo.multiple ? 'Digite para adicionar autores...' : 'Digite para buscar...'}" autocomplete="off">
                <input type="hidden" id="${campo.id}">
                <ul id="lista-${campo.id}" class="hidden absolute w-full bg-white border border-gray-300 rounded-b-lg shadow-2xl max-h-60 overflow-y-auto z-50 mt-1"></ul>
            `;
        
        case 'tipo-hq':
            return `
                ${label}
                <select id="${campo.id}" ${campo.required ? 'required' : ''} class="${inputBaseClass} bg-white">
                    <option value="" disabled selected>Selecione...</option>
                    <option value="HQ">HQ</option>
                    <option value="Mangá">Mangá</option>
                    <option value="Gibi">Gibi</option>
                    <option value="Graphic Novel">Graphic Novel</option>
                </select>
            `;

        case 'volumes-list':
            return `
                <label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                <div id="container-${campo.id}" class="flex flex-col gap-3 mb-3"></div>
                <button type="button" id="btn-add-${campo.id}" class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition">+ Adicionar Volume</button>
            `;

        case 'faixas-list':
            return `
                <label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                <div id="container-${campo.id}" class="flex flex-col gap-2 mb-3"></div>
                <button type="button" id="btn-add-${campo.id}" class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition w-full md:w-auto">+ Adicionar Faixa</button>
            `;

        case 'file':
            return `
                ${label}
                <input type="file" id="${campo.id}" accept="image/*" class="${inputBaseClass} bg-white">
            `;

        default:
            return `
                ${label}
                <input type="${campo.type}" id="${campo.id}" ${campo.required ? 'required' : ''} class="${inputBaseClass}">
            `;
    }
}

function configurarLogicaCampo(campo) {
    if (campo.type === 'autor-search') {
        // Passa funções globais para permitir preenchimento externo
        window[`setupAuth_${campo.id}`] = configurarAutorSearch(campo);
    } else if (campo.type === 'volumes-list') {
        window[`setupVols_${campo.id}`] = configurarListaVolumes(campo);
        // Se for novo item, cria um vazio. Se for edição, esperamos a função de preencher.
        if (!editMode) window[`setupVols_${campo.id}`].adicionar();
    } else if (campo.type === 'faixas-list') {
        window[`setupFaixas_${campo.id}`] = configurarListaFaixas(campo);
        if (!editMode) window[`setupFaixas_${campo.id}`].adicionar();
    }
}

// --- LÓGICA DOS CAMPOS COMPLEXOS ---

function configurarAutorSearch(campo) {
    const inputVisual = document.getElementById(`${campo.id}-visual`);
    const inputOculto = document.getElementById(campo.id);
    const listaUl = document.getElementById(`lista-${campo.id}`);
    const tagsContainer = document.getElementById(`tags-${campo.id}`);
    let selecionados = [];

    const renderTags = () => {
        tagsContainer.innerHTML = '';
        selecionados.forEach((item, index) => {
            const tag = document.createElement('span');
            tag.className = "bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2";
            tag.innerHTML = `${item.nome} <button type="button" class="text-teal-600 hover:text-red-500 font-bold">×</button>`;
            tag.querySelector('button').onclick = () => {
                selecionados.splice(index, 1);
                atualizarInput();
                renderTags();
            };
            tagsContainer.appendChild(tag);
        });
    };

    const atualizarInput = () => {
        if (campo.multiple) inputOculto.value = JSON.stringify(selecionados.map(s => s.id));
        else inputOculto.value = selecionados.length > 0 ? selecionados[0].id : '';
    };

    // Função exposta para popular dados na edição
    const setSelecionados = (novosDados) => {
        selecionados = novosDados;
        renderTags();
        atualizarInput();
        if (!campo.multiple && selecionados.length > 0) {
            inputVisual.value = selecionados[0].nome;
        }
    }

    const filtrar = (texto) => {
        listaUl.innerHTML = '';
        const termo = texto.toLowerCase();
        const filtrados = listaAutores.filter(autor => 
            autor.nome.toLowerCase().includes(termo) && 
            !selecionados.some(sel => sel.id === autor._id)
        );

        if (filtrados.length === 0) listaUl.innerHTML = `<li class="p-3 text-gray-500 italic">Nada encontrado.</li>`;
        else {
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
                    atualizarInput();
                    renderTags();
                    if(campo.multiple) filtrar('');
                };
                listaUl.appendChild(li);
            });
        }
        listaUl.classList.remove('hidden');
    };

    inputVisual.addEventListener('input', (e) => filtrar(e.target.value));
    inputVisual.addEventListener('focus', () => filtrar(inputVisual.value));
    document.addEventListener('click', (e) => {
        if (inputVisual && !inputVisual.parentElement.contains(e.target)) listaUl.classList.add('hidden');
    });

    return { setSelecionados };
}

// --- NOVO: Preenchimento de Autores na Edição ---
function preencherAutoresSearch(campo, item) {
    const setup = window[`setupAuth_${campo.id}`];
    if (!setup) return;

    // Backend pode retornar 'autores' (array de objetos) ou 'autor' (objeto único)
    let dados = item[campo.id];
    
    // Normaliza para array de formato {id, nome}
    let formatados = [];

    if (Array.isArray(dados)) {
        formatados = dados.map(a => ({ id: a._id, nome: a.nome }));
    } else if (dados && typeof dados === 'object') {
        formatados = [{ id: dados._id, nome: dados.nome }];
    }

    setup.setSelecionados(formatados);
}

function configurarListaVolumes(campo) {
    const btnAdd = document.getElementById(`btn-add-${campo.id}`);
    const containerVols = document.getElementById(`container-${campo.id}`);

    const adicionarVolume = (dados = null) => {
        const row = document.createElement('div');
        row.className = "volume-item bg-gray-50 p-3 rounded-lg border border-gray-200 relativeKv grid grid-cols-1 md:grid-cols-2 gap-3 mb-2";
        
        const tituloVal = dados ? dados.titulo || '' : '';
        const tituloAltVal = dados ? dados.tituloAlt || '' : '';
        const numVal = dados ? dados.volume : '';
        const checkVal = dados ? (dados.emEstoque ? 'checked' : '') : 'checked';

        row.innerHTML = `
            <input type="text" value="${tituloVal}" placeholder="Título do Volume (Opcional)" class="vol-titulo w-full border border-gray-300 p-2 rounded font-comfortaa text-sm">
            <input type="text" value="${tituloAltVal}" placeholder="Título Alternativo (opcional)" class="vol-titulo-alt w-full border border-gray-300 p-2 rounded font-comfortaa text-sm">
            <div class="flex gap-3">
                <input type="number" value="${numVal}" placeholder="Nº Vol." class="vol-numero w-20 border border-gray-300 p-2 rounded font-comfortaa text-sm" required>
                <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" class="vol-estoque w-4 h-4 accent-teal-500" ${checkVal}> Em Estoque
                </label>
            </div>
            <button type="button" class="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xl" title="Remover">×</button>
        `;
        row.querySelector('button').onclick = () => row.remove();
        containerVols.appendChild(row);
    };

    btnAdd.onclick = () => adicionarVolume();
    return { adicionar: adicionarVolume };
}

// --- NOVO: Preenchimento de Volumes ---
function preencherVolumes(id, volumes) {
    const container = document.getElementById(`container-${id}`);
    container.innerHTML = ''; // Limpa o padrão
    const setup = window[`setupVols_${id}`];
    if (volumes && volumes.length > 0) {
        volumes.forEach(vol => setup.adicionar(vol));
    } else {
        setup.adicionar(); // Adiciona um vazio se não tiver
    }
}

function configurarListaFaixas(campo) {
    const btnAdd = document.getElementById(`btn-add-${campo.id}`);
    const containerFaixas = document.getElementById(`container-${campo.id}`);

    const atualizarIndices = () => {
        containerFaixas.querySelectorAll('.faixa-index').forEach((span, i) => span.textContent = i + 1);
    };

    const adicionarFaixa = (dados = null) => {
        const row = document.createElement('div');
        row.className = "faixa-item bg-gray-50 p-2 rounded-lg border border-gray-200 flex gap-2 items-center";
        
        const tituloVal = dados ? dados.titulo || '' : '';
        const duracaoVal = dados ? dados.duracao || '' : '';

        row.innerHTML = `
            <span class="faixa-index font-bold text-gray-400 select-none w-6 text-center">#</span>
            <input type="text" value="${tituloVal}" placeholder="Nome da Música" class="faixa-titulo flex-1 border border-gray-300 p-2 rounded font-comfortaa text-sm" required>
            <input type="text" value="${duracaoVal}" placeholder="Duração (ex: 3:45)" class="faixa-duracao w-24 md:w-32 border border-gray-300 p-2 rounded font-comfortaa text-sm">
            <button type="button" class="text-red-400 hover:text-red-600 font-bold text-xl px-2" title="Remover">×</button>
        `;
        row.querySelector('button').onclick = () => {
            row.remove();
            atualizarIndices();
        };
        containerFaixas.appendChild(row);
        atualizarIndices();
    };

    btnAdd.onclick = () => adicionarFaixa();
    return { adicionar: adicionarFaixa };
}

// --- NOVO: Preenchimento de Faixas ---
function preencherFaixas(id, faixas) {
    const container = document.getElementById(`container-${id}`);
    container.innerHTML = '';
    const setup = window[`setupFaixas_${id}`];
    if (faixas && faixas.length > 0) {
        faixas.forEach(f => setup.adicionar(f));
    } else {
        setup.adicionar();
    }
}

// --- ENVIO DO FORMULÁRIO ---

async function processarEnvio(e, seletor, token) {
    e.preventDefault();
    const schemas = getSchemas();
    const config = schemas[seletor.value];
    const formData = new FormData();

    for (const campo of config.campos) {
        const input = document.getElementById(campo.id);

        // 1. Campo de Arquivo
        if (campo.type === 'file') {
            if (input.files[0]) formData.append('imagem', input.files[0]);
        } 
        // 2. Campos de Listas (Volumes/Faixas) - Coleta Manual
        else if (campo.type === 'volumes-list') {
            const dadosVolumes = coletarVolumes(campo.id);
            formData.append(campo.id, JSON.stringify(dadosVolumes));
        } 
        else if (campo.type === 'faixas-list') {
            const dadosFaixas = coletarFaixas(campo.id);
            formData.append(campo.id, JSON.stringify(dadosFaixas));
        }
        // 3. Campos Normais e Autores
        else {
            let valor = input.value;
            
            // Validação de Autor
            if (campo.type === 'autor-search' && (!valor || valor === '[]' || valor === '')) {
                alert(`Selecione pelo menos um ${campo.label}!`);
                return;
            }

            // Transformações
            if (campo.transform === 'array') {
                const arr = valor.split(',').map(s => s.trim()).filter(s => s);
                formData.append(campo.id, JSON.stringify(arr));
            } else {
                formData.append(campo.id, valor);
            }
        }
    }

    // --- NOVO: Lógica para POST (Criar) ou PUT (Atualizar) ---
    const metodo = editMode ? 'PUT' : 'POST';
    const urlFinal = editMode ? `${VERCEL_URL}${config.endpoint}/${currentId}` : `${VERCEL_URL}${config.endpoint}`;

    // Envio
    try {
        const response = await fetch(urlFinal, {
            method: metodo,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            const msg = editMode ? "Item atualizado com sucesso!" : "Item adicionado com sucesso!";
            alert(msg);
            if (editMode) {
                // Se editou, volta pra home
                window.location.href = 'index.html';
            } else {
                // Se criou, limpa o form
                seletor.value = ""; 
                document.getElementById('formDinamico').classList.add('hidden');
            }
        } else {
            alert(`Erro: ${result.error || result.message}`);
        }
    } catch (error) {
        console.error(error);
        alert("Erro de conexão");
    }
}

function coletarVolumes(containerId) {
    const linhas = document.querySelectorAll(`#container-${containerId} .volume-item`);
    let lista = [];
    linhas.forEach(linha => {
        const titulo = linha.querySelector('.vol-titulo').value;
        const volume = linha.querySelector('.vol-numero').value;
        if (volume) { // Título pode ser opcional
            lista.push({
                titulo: titulo,
                tituloAlt: linha.querySelector('.vol-titulo-alt').value,
                volume: Number(volume),
                emEstoque: linha.querySelector('.vol-estoque').checked
            });
        }
    });
    return lista;
}

function coletarFaixas(containerId) {
    const linhas = document.querySelectorAll(`#container-${containerId} .faixa-item`);
    let lista = [];
    linhas.forEach(linha => {
        const titulo = linha.querySelector('.faixa-titulo').value;
        if (titulo) {
            lista.push({
                titulo: titulo,
                duracao: linha.querySelector('.faixa-duracao').value
            });
        }
    });
    return lista;
}