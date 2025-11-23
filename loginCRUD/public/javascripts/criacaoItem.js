// Variáveis globais para o campo de autor/artista/banda, serão preenchidos depois
let listaAutores = [];
let listaArtistas = []; 

// Variáveis globais para controle de edição
let editMode = false; // (talvez chamar de "flag" seria mais apropriado)
let currentId = null;

/*######################################
    Schemas

    Configuração de schemas - estruturas a seguir para o banco de dados aceitar
    (A criação do formulário foi completamente automatizada por IA, teria sido bem chato configurar na mão todos esses campos)

    Além de base para inserir no banco de dados, o codigo vai usar esse objetão para o a criação dinamica do formulário 
    (O endpoint aqui tem o mesmo propósito que em carregaItem.js, dê uma olhada na explicação de lá também)
    
######################################*/
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
            { id: 'tipo', label: 'Tipo', type: 'tipo-cd', required: true },
            { id: 'genero', label: 'Gênero Musical', type: 'text' },
            { id: 'ano', label: 'Ano', type: 'number' },
            { id: 'duracaoTotal', label: 'Duração Total (minutos)', type: 'number' },
            { id: 'artista', label: 'Artista/Banda', type: 'artista-search', required: true },
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
            { id: 'autores', label: 'Autores, Diretores e/ou Roteiristas', type: 'autor-search', multiple: true, required: true, transform: 'arrayId' },
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
    },
    'artistas': {
        endpoint: '/artistas',
        campos: [
            { id: 'nome', label: 'Nome da Banda/Artista', type: 'text', required: true },
            { id: 'nacionalidade', label: 'Nacionalidade', type: 'text' },
            { id: 'imagem', label: 'Upload da Foto (opcional)', type: 'file' }
        ]
    }
});

// INICIALIZAÇÃO (das coisas importantes ao carregar a pagina (DOMContentLoaded))
document.addEventListener('DOMContentLoaded', async () => {
    // Nessa página, só podemos entrar se estivermos logados
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = 'login.html';
        return;
    }

    // Preparando aonde vamos colocar o formulário
    const seletor = document.getElementById('seletorTipo');
    const form = document.getElementById('formDinamico');
    const container = document.getElementById('camposContainer');

    seletor.addEventListener('change', (e) => {
        const schemas = getSchemas();
        const config = schemas[e.target.value];
        if (config) {
            renderizarFormulario(config, container, form);
        }
    });

    // Carregando dados especiais que precisam estar já carregados (campo autor/artista/banda)
    // Por ser mais de 1 request, usamos o await Promise.all, pois não apenas precisamos pedir pro navegador (que é um tanto impaciente) esperar receber o dado enviado para prosseguirmos, mas também precisamos avisar que virá mais de 1 dado de uma vez (Promise.all). (Curiosidade: o Promisse.all faz todas as requisições de uma vez (em pararelo), e devolve tudo junto, assim que tudo estiver pronto) 
    await Promise.all([carregarAutores(seletor), carregarArtistas()]);

    // Como essa página também é usada para editar os itens, verificamos se na url existem os parametros necessários para entrarmos no "modo edição"
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    const paramTipo = urlParams.get('tipo');

    if (paramId && paramTipo) {
        editMode = true;
        currentId = paramId;
        
        document.querySelector('h1').textContent = "Editar Item";
        document.getElementById('botaoSavar').value = "Atualizar item";

        // Marcamos o formulário para selecionar automaticamente o tipo do item a ser editado...
        seletor.value = paramTipo;
        // ... e impedimos que qualquer outra seleção de tipo seja feita
        seletor.disabled = true;

        // Carregamos as configurações definidas no schema...
        const schemas = getSchemas();
        const config = schemas[paramTipo];
        
        // ... E populamos os formulário dinamico com as configurações
        if (config) {
            renderizarFormulario(config, container, form);
            await carregarDadosEdicao(paramTipo, paramId, config);
        }
    } else if (paramTipo) {
        // Se tiver apenas o tipo na URL (ex: botão Novo Autor), seleciona e carrega o form
        seletor.value = paramTipo;
        // Dispara manualmente o evento para renderizar o formulário
        seletor.dispatchEvent(new Event('change'));
    }

    // Configurando o que deve acontecer ao enviar (submit) o formulário
    form.addEventListener('submit', (e) => processarEnvio(e, seletor, token));

    /* Para facilitar as coisas, se você trocar de aba/minimizar a janela, a lista de autores/artistas/bandas será atualizada
    Isso é feito com o tipo de EventListener "visibilitychange"
    */
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === 'visible') {
            // Sendo o documento (pagina) visivel no navegador, após uma mudança visual de estado (troca de aba, janela minimizada, etc)...
            console.log("Verificando atualizações...");
            try {
                const [resAutores, resArtistas] = await Promise.all([
                    fetch(`${VERCEL_URL}/autores`),
                    fetch(`${VERCEL_URL}/artistas`)
                ]);
                
                const dadosAutores = await resAutores.json();
                const dadosArtistas = await resArtistas.json();

                // ... atualiza os dados a serem exibidos
                // Dessa forma, não é necessário refazer o preenchimento na página, caso você tenha esquecido de adicionar um autor, por exemplo. Pode apenas clicar no botão para adicionar um novo (que abrirá propositalmente uma nova pagina, em outra aba), e voltando para a pagina, o novo autor adicioanado já estará visivel e pronto para seleção/inserção no banco
                if (Array.isArray(dadosAutores)) {
                    listaAutores = dadosAutores;
                    console.log("Autores atualizados:", listaAutores.length, listaAutores);
                }
                if (Array.isArray(dadosArtistas)) {
                    listaArtistas = dadosArtistas;
                    console.log("Artistas atualizados:", listaArtistas.length, listaAutores);
                }
            } catch (e) {
                console.error("Falha no auto-update", e);
            }
        }
    });
});

/*######################################
    Funções

    Fazendo tudo funcionar propriamente
    (as funções com "async" são as que pedem algo pro vercel/banco de dados.
    Como o navegador é impaciente, precisamos deixar explicito que isso vai demorar e a resposta não virá de uma vez (async, await), caso contrário, ele iria passar reto, sem nem ter recebido a resposta, e o código quebraria completamente (ele tentaria trabalhar com valores nulos/indefinidos).)
    
######################################*/

/* Um GET simples que preenche a variavel global lá do topo
    (Observação: como chamamos essa função e a de baixo no Promisse.all, não precisamos desse processo de configurar o seletor nas duas. O que ele faz é criar uma proteção, para que o usuario não consiga selecionar qualquer coisa enquanto ela não terminar de carregar os autores)
 */
async function carregarAutores(seletor) {
    if(seletor) seletor.disabled = true; // Assim que entrar aqui, trava o seletor de tipos, para não correr risco de quebrar algo (disabled = true, ou seja, está desativado)
    
    try {
        const response = await fetch(`${VERCEL_URL}/autores`);
        const dados = await response.json();
        
        if (Array.isArray(dados)) {
            listaAutores = dados;
            if (!editMode && seletor) seletor.disabled = false; // terminando tudo, e tudo ocorrendo bem, pode liberar o seletor (disabled = false, ou seja, está ativo)
        }
    } catch (error) {
        console.error("Erro ao carregar autores:", error);
    }
}

// Um GET simples que preenche a outra variavel global lá do topo
// Não precisamos configurar o seletor (ver explicação da função anterior)
async function carregarArtistas() {
    try {
        const response = await fetch(`${VERCEL_URL}/artistas`);
        const dados = await response.json();
        
        if (Array.isArray(dados)) {
            listaArtistas = dados;
        }
    } catch (error) {
        console.error("Erro ao carregar artistas:", error);
    }
}
// Um GET um pouco mais elaborado, usando as rodas que pedem o id de algo
async function carregarDadosEdicao(tipo, id, config) {
    try {
        const response = await fetch(`${VERCEL_URL}${config.endpoint}/${id}`);
        // por exemplo: https://dev-web-ii-projeto-crud-login.vercel.app/hqs/6919f40bdb67cc01c1e59995, que vai retornar a entrada "Jojo's Bizarre Adventure"
        if (!response.ok) throw new Error('Item não encontrado');
        const item = await response.json(); // guardando a resposta que recebemos

        config.campos.forEach(campo => {
            const element = document.getElementById(campo.id);
            // Para cada campo (campo.forEach), faça essas coisas (no caso, rode as funções de popular os campos a serem editados.)
            
            if (campo.type === 'file') return;
            if (campo.type === 'volumes-list') return preencherVolumes(campo.id, item[campo.id]);
            if (campo.type === 'faixas-list') return preencherFaixas(campo.id, item[campo.id]);
            if (campo.type === 'autor-search') return preencherAutoresSearch(campo, item);
            if (campo.type === 'artista-search') return preencherArtistasSearch(campo, item);

            if (element) {
            /* Existindo "elemento" na tela, se ele veio configurado como array e o array é realmente uma lista, separe* os itens por ", ". Caso contrário, coloque item[campo.id] ou então deixe o campo vazio

            *(apenas por modo de dizer, "join" na verade junta cada item do array como string, colocando algo entre eles)
            */
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

// Escrever os dados na tela
function renderizarFormulario(config, container, form) {
    container.innerHTML = ''; // Limpa o html do container totalmente, para termos certeza que podemos trabalhar nele sem quaisquer complicações (innerHTML = '', ou seja, transforma o html dentro desse elemento em nada)
    form.classList.remove('hidden');
    // por padrão, os formulários ficam escondidos. Quando vamos exibir ele, ele já pode aparecer sem problemas (seria um problema ter TODOS na tela ao mesmo tempo, né?)

    config.campos.forEach(campo => {
        const divWrapper = document.createElement('div'); // Para cada campo, crie uma div, 
        divWrapper.className = "relative mb-4"; // configure o css dela,
        divWrapper.innerHTML = gerarHTMLCampo(campo); // preencha com os campos que definimos e configuramos no nosso schema (importante lembrar que qual vai ser o schema em especifico foi determinado por outra função anteriormente)...
        container.appendChild(divWrapper); // e aplique ela na tela, dentro do container
        setTimeout(() => configurarLogicaCampo(campo), 0);
        /* Esse setTimeout possui uma aplicação bem importante e interessante aqui:
            Como estamos criando campos e logo em seguida configurando eles, poderia acontecer do navegador não ter terminado/carregado 100% a criação, e estariamos tentando acessar campos não existentes (ou talvez meio existentes?)
            
            Definir o setTimeout para 0 milissegundos é uma forma de deixar explicito ao navegador que essa tarefa deve ser colocada no final da "lista de afazeres", assim que as demais forem concluidas
        */
    });
}

// Nome autoexplicativo, serve para gerar determinados campos, baseados em determinadas configurações, conforme necessário (note os usos do "swtich case"!)
function gerarHTMLCampo(campo) {
    const label = `<label class="block font-vend-sans text-gray-700 mb-1 font-bold text-sm">${campo.label}</label>`;
    const inputBaseClass = "w-full border border-gray-300 p-2.5 rounded-lg font-comfortaa focus:ring-2 focus:ring-teal-400 outline-none";

    switch (campo.type) {
        case 'autor-search':
            return `
                <div class="flex justify-between items-center mb-1">
                    ${label.replace('mb-1', 'mb-0')} 
                    <div class="group bg-green-700 hover:bg-green-500 text-white cursor-pointer flex items-center justify-center h-6 transition-all duration-300 rounded shadow-sm border border-teal-900">
                        <a href="criacaoItem.html?tipo=autores" target="_blank" class="flex items-center px-2 h-full gap-0 group-hover:gap-1 transition-all duration-300" title="Criar novo autor">
                            <i class='fas fa-plus text-[10px]'></i>
                            <span class="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide">Novo</span>
                        </a>
                    </div>
                </div>
                <div id="tags-${campo.id}" class="flex flex-wrap gap-2 mb-2"></div>
                <input type="text" id="${campo.id}-visual" class="${inputBaseClass}" placeholder="${campo.multiple ? 'Digite para adicionar...' : 'Digite para buscar...'}" autocomplete="off">
                <input type="hidden" id="${campo.id}">
                <ul id="lista-${campo.id}" class="hidden absolute w-full bg-white border border-gray-300 rounded-b-lg shadow-2xl max-h-60 overflow-y-auto z-50 mt-1"></ul>
            `;
        
        case 'artista-search':
            return `
                <div class="flex justify-between items-center mb-1">
                    ${label.replace('mb-1', 'mb-0')} 
                    <div class="group bg-green-700 hover:bg-green-500 text-white cursor-pointer flex items-center justify-center h-6 transition-all duration-300 rounded shadow-sm border border-teal-900">
                        <a href="criacaoItem.html?tipo=artistas" target="_blank" class="flex items-center px-2 h-full gap-0 group-hover:gap-1 transition-all duration-300" title="Criar novo artista">
                            <i class='fas fa-plus text-[10px]'></i>
                            <span class="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide">Novo</span>
                        </a>
                    </div>
                </div>
                <div id="tags-${campo.id}" class="flex flex-wrap gap-2 mb-2"></div>
                <input type="text" id="${campo.id}-visual" class="${inputBaseClass}" placeholder="Digite para buscar artista..." autocomplete="off">
                <input type="hidden" id="${campo.id}">
                <ul id="lista-${campo.id}" class="hidden absolute w-full bg-white border border-gray-300 rounded-b-lg shadow-2xl max-h-60 overflow-y-auto z-50 mt-1"></ul>
            `;

        case 'tipo-hq':
            return `${label}<select id="${campo.id}" ${campo.required ? 'required' : ''} class="${inputBaseClass} bg-white">
                    <option value="" disabled selected>Selecione...</option>
                    <option value="HQ">HQ</option>
                    <option value="Mangá">Mangá</option>
                    <option value="Gibi">Gibi</option>
                    <option value="Graphic Novel">Graphic Novel</option>
                </select>`;

        case 'tipo-cd':
            return `${label}<select id="${campo.id}" ${campo.required ? 'required' : ''} class="${inputBaseClass} bg-white">
                    <option value="" disabled selected>Selecione...</option>
                    <option value="Musica">Musica</option>
                    <option value="Áudio">Áudio</option>
                    <option value="Outro">Outro</option>
                </select>`;    

        case 'volumes-list':
            return `<label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                <div id="container-${campo.id}" class="flex flex-col gap-3 mb-3"></div>
                <button type="button" id="btn-add-${campo.id}" class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition">+ Adicionar Volume</button>`;

        case 'faixas-list':
            return `<label class="block font-vend-sans text-gray-700 mb-2 font-bold text-sm">${campo.label}</label>
                <div id="container-${campo.id}" class="flex flex-col gap-2 mb-3"></div>
                <button type="button" id="btn-add-${campo.id}" class="text-teal-600 border border-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 font-bold text-sm transition w-full md:w-auto">+ Adicionar Faixa</button>`;

        case 'file':
            return `${label}<input type="file" id="${campo.id}" accept="image/*" class="${inputBaseClass} bg-white">`;

        default:
            return `${label}<input type="${campo.type}" id="${campo.id}" ${campo.required ? 'required' : ''} class="${inputBaseClass}">`;
    }
}

/* Aqui é usada uma sintaxe estranha e curiosa para a criação dinamica de variaveis globais:
    window é um objeto global do javascript/navegador, e é como se estivessemos usando ele como caixa para guardar essa variavel, para depois usar ela em outros lugares (ja que window é global, podemos, apesar de meio gambiarra).
    O que está entre colchetes acaba se tornando o nome dessa variavel. Acontece que [`setupAutor_${campo.id}] vai ser traduzido no nome do campo a ser configurado, logo, setupAutor_autores ou setupAutor_autor.
    E importante notar: como qualquer variavel, ela recebe um valor, aqui, o valor vindo das funções de configuração
*/
function configurarLogicaCampo(campo) {
    if (campo.type === 'autor-search') {
        window[`setupAutor_${campo.id}`] = configurarAutorSearch(campo);
    } 
    else if (campo.type === 'artista-search') {
        window[`setupArtist_${campo.id}`] = configurarArtistaSearch(campo);
    }
    else if (campo.type === 'volumes-list') {
        window[`setupVols_${campo.id}`] = configurarListaVolumes(campo);
        if (!editMode) window[`setupVols_${campo.id}`].adicionar(); // Esse adicionar é como um metodo/objeto privado de configurarListaVolumes(), criado no return dessa função
    } 
    else if (campo.type === 'faixas-list') {
        window[`setupFaixas_${campo.id}`] = configurarListaFaixas(campo);
        if (!editMode) window[`setupFaixas_${campo.id}`].adicionar(); // Esse adicionar é como um metodo privado de configurarListaFaixas(), criado no return dessa função
    }
}

/*######################################
    Lógicas de busca (search)
    e configurações/formatações especificas 

######################################*/

function configurarSearchGenerico(campo, getListaDados) { 
    // Como essa função é generica, não se preocupa muito com quando dado estamos tratando (isso será feito mais pra frente)
    const inputVisual = document.getElementById(`${campo.id}-visual`);
    const inputOculto = document.getElementById(campo.id);
    const listaUl = document.getElementById(`lista-${campo.id}`);
    const tagsContainer = document.getElementById(`tags-${campo.id}`);
    
    // Aqui serão armazenados todos os itens (autores, artistas, bandas) que forem selecionados
    // É importante para separarmos o que foi selecionado e precisa de um tratamente especial do resto, que pode continuar como já está
    let selecionados = [];

    const renderTags = () => { // As "tags" são os itens que, quando selecionado, aparecem como "bolha" em cima do campo
        tagsContainer.innerHTML = '';
        selecionados.forEach((item, index) => {
            const tag = document.createElement('span'); // preparando cada "bolha" que precisa aparecer (caso o elemento seja selecionado)
            tag.className = "bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2";
            tag.innerHTML = `${item.nome} <button type="button" class="text-teal-600 hover:text-red-500 font-bold">×</button>`;
            tag.querySelector('button').onclick = () => {
                selecionados.splice(index, 1); // ao clicar no "x", remove o item selecionado do array "selecionados"...
                atualizarInput(); // ...atualiza a lista...
                renderTags(); // ... e chama a si mesma para atualizar também as "bolhas" dos itens selecionados
            };
            tagsContainer.appendChild(tag); // terminando tudo, insere o elemento criado no html
        });
    };

    const atualizarInput = () => {
        if (campo.multiple) inputOculto.value = JSON.stringify(selecionados.map(s => s.id));
        else inputOculto.value = selecionados.length > 0 ? selecionados[0].id : '';
    };

    // Função para "setar" os selecionados
    const setSelecionados = (novosDados) => {
        selecionados = novosDados;
        renderTags();
        atualizarInput();
        if (!campo.multiple && selecionados.length > 0) {
            inputVisual.value = selecionados[0].nome;
        }
    }

    const filtrar = (texto) => {
        /* Função que filtra a lista, removendo o que foi selecionado

        Basicamente, aqui é tratado o texto inserido pelo usuario, para comparar se:
            1 - o que foi digitado existe
            2 - o que foi digitado está selecionado (dentro de uma "bolha")
        Com isso, ele formata o que recebemos lá atrás do banco de dados em uma lista selecionavel e responsiva
        */
        listaUl.innerHTML = '';
        const termo = texto.toLowerCase();
        
        const listaAtual = getListaDados(); 
        
        const filtrados = listaAtual.filter(item => 
            item.nome.toLowerCase().includes(termo) && 
            !selecionados.some(sel => sel.id === item._id)
        );

        if (filtrados.length === 0) listaUl.innerHTML = `<li class="p-3 text-gray-500 italic">Nada encontrado.</li>`;
        else {
            filtrados.forEach(item => {
                const li = document.createElement('li');
                li.className = "p-3 hover:bg-teal-100 cursor-pointer border-b border-gray-100 font-comfortaa text-sm";
                li.textContent = item.nome;
                li.onclick = () => {
                    if (campo.multiple) {
                        selecionados.push({ id: item._id, nome: item.nome });
                        inputVisual.value = '';
                        inputVisual.focus();
                    } else {
                        selecionados = [{ id: item._id, nome: item.nome }];
                        inputVisual.value = item.nome;
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

    // Configurando a forma como o campo deve aparecer ou não
    inputVisual.addEventListener('input', (e) => filtrar(e.target.value)); // ao receber input, filtre
    inputVisual.addEventListener('focus', () => filtrar(inputVisual.value)); // ao estar em foco, filtre
    document.addEventListener('click', (e) => { // ao ser clicado...
        if (inputVisual && !inputVisual.parentElement.contains(e.target)) { // se for fora do campo, então esconda ele
            listaUl.classList.add('hidden');
        }
    });

    return { setSelecionados };
}

// Função que usa a configurarSearchGenerico, mas especificando como (configurarSearchGenerico pede também uma lista de dados para trabalhar, e aqui estamos especificando qual)
function configurarAutorSearch(campo) {
    return configurarSearchGenerico(campo, () => listaAutores);
}

// Função que usa a configurarSearchGenerico, mas especificando como (configurarSearchGenerico pede também uma lista de dados para trabalhar, e aqui estamos especificando qual)
function configurarArtistaSearch(campo) {
    return configurarSearchGenerico(campo, () => listaArtistas);
}

// Se lembra da nossa "função-global-gambiarra"? Então, é aqui que vai ser usada, nas funções preencherAutoresSearch e preencherArtistasSearch...
function preencherAutoresSearch(campo, item) {
    const setup = window[`setupAutor_${campo.id}`];
    if (!setup) return;
    formatarEPreencherSearch(campo, item, setup);
}

function preencherArtistasSearch(campo, item) {
    const setup = window[`setupArtist_${campo.id}`];
    if (!setup) return;
    formatarEPreencherSearch(campo, item, setup);
}

// ... pois fazem parte do setup aqui. Essa é a função que formata/limpa o que foi recebido do banco de dados, trata esses dados, e envia eles para serem usados por setSelecionados
function formatarEPreencherSearch(campo, item, setup) {
    let dados = item[campo.id];
    let formatados = [];

    if (Array.isArray(dados)) {
        formatados = dados.map(a => ({ id: a._id, nome: a.nome }));
    } else if (dados && typeof dados === 'object') {
        formatados = [{ id: dados._id, nome: dados.nome }];
    }
    setup.setSelecionados(formatados);
}

// Funções especial para listar/formatar/exibir os varios volumes que uma HQ pode ter
function configurarListaVolumes(campo) {
    const btnAdd = document.getElementById(`btn-add-${campo.id}`);
    const containerVols = document.getElementById(`container-${campo.id}`);

    const adicionarVolume = (dados = null) => {
        const row = document.createElement('div');
        row.className = "volume-item bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 relative";
        
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

// Mais uma vez a função-global-gambiarra retorna, e aqui o metodo/objeto privado também aparece
function preencherVolumes(id, volumes) {
    const container = document.getElementById(`container-${id}`);
    container.innerHTML = '';
    const setup = window[`setupVols_${id}`];
    if (volumes && volumes.length > 0) {
        volumes.forEach(vol => setup.adicionar(vol));
    } else {
        setup.adicionar();
    }
}

// Essas duas funcionam como as de cima, formatam e exibem uma lista
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

/*######################################
    Logicas dos envios (para o banco de daddos)
    
######################################*/
async function processarEnvio(e, seletor, token) {
    e.preventDefault();
    const schemas = getSchemas();
    const config = schemas[seletor.value];
    const formData = new FormData();

    for (const campo of config.campos) {
        // "Para cada campo, recolhe os dados que estão neles"
        const input = document.getElementById(campo.id);

        if (campo.type === 'file') {
            if (input.files[0]) formData.append('imagem', input.files[0]);
        } 
        else if (campo.type === 'volumes-list') {
            formData.append(campo.id, JSON.stringify(coletarVolumes(campo.id)));
        } 
        else if (campo.type === 'faixas-list') {
            formData.append(campo.id, JSON.stringify(coletarFaixas(campo.id)));
        }
        else {
            let valor = input.value;
            
            // Validação de Autor/Artista (tem algo nos campos? O que tem lá, é nulo?)
            if ((campo.type === 'autor-search' || campo.type === 'artista-search') && (!valor || valor === '[]' || valor === '')) {
                alert(`Selecione pelo menos um ${campo.label}!`);
                return;
            }

            // Filtro no array, passando item por (.map), removendo os nulos (.trim()), removendo os repetidos (filter(s => s))
            if (campo.transform === 'array') {
                const arr = valor.split(',').map(s => s.trim()).filter(s => s);
                formData.append(campo.id, JSON.stringify(arr)); // manda o array, formatando ele pro json (JSON.stringify)
            } else {
                formData.append(campo.id, valor);
            }
        }
    }

    // Configuração dinamica caso estejamos no modo edição (put, update) ou criação (post, create)
    const metodo = editMode ? 'PUT' : 'POST';
    // Caso estejamos no modo edição, adicionamos o id que queremos editar
    const urlFinal = editMode ? `${VERCEL_URL}${config.endpoint}/${currentId}` : `${VERCEL_URL}${config.endpoint}`;

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
                window.location.href = 'index.html';
            } else {
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
    // forEach para coletar cada um dos volumes adicionados
    const linhas = document.querySelectorAll(`#container-${containerId} .volume-item`);
    let lista = [];
    linhas.forEach(linha => {
        const titulo = linha.querySelector('.vol-titulo').value;
        const volume = linha.querySelector('.vol-numero').value;
        if (volume) {
            lista.push({ // cria um objeto com as informações, coloca ele no final do array (push)
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
    // forEach para coletar cada um dos volumes adicionados
    const linhas = document.querySelectorAll(`#container-${containerId} .faixa-item`);
    let lista = [];
    linhas.forEach(linha => { // cria um objeto com as informações, coloca ele no final do array (push)
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