const express = require('express');
const router = express.Router();
const Artista = require('../models/Artista');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

const multer = require('multer');
const { uploadStream } = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST (Criar) - Protegido (note esse authenticate)
router.post('/', authenticate, upload.single('imagem'), async (req, res) => {
    try {
        // "Espalha" todos os campos de texto que vieram (nome, tipo, ano, etc.)
        const dados = { ...req.body };

        // Lógica da Imagem (Só adiciona se existir arquivo, caso não exista, pode passar reto)
        if (req.file) {
            const result = await uploadStream(req.file.buffer);
            dados.urlFoto = result.secure_url;
        }

        // Converter campos "Array" que vieram como JSON String
        // O front-end manda arrays como string "[...]" via FormData.
        // O Mongoose precisa de Arrays reais. Vamos converter automaticamente:
        const camposArray = ['genero', 'autores', 'volumes', 'faixas']; // Lista de campos que podem ser arrays no seu sistema
        // o Mongoose so vai usar os que forem necessários

        camposArray.forEach(campo => {
            if (dados[campo]) {
                try {
                    // Tenta converter de String JSON para Array JS
                    dados[campo] = JSON.parse(dados[campo]);
                } catch (e) {
                    // Se não for JSON (ex: veio vazio ou formato errado), não faz nada ou define vazio
                    console.warn(`Falha ao converter JSON do campo ${campo}`);
                }
            }
        });

        if (req.user) {
            dados.adicionadoPor = req.user._id;
            dados.alteradoPor = req.user._id;
            dados.dataAlteracao = Date.now();
        }

        const artista = new Artista(dados);
        await artista.save();
        res.status(201).json(artista);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET (Listar) - Público (note que nao tem authenticate)
router.get('/', async (req, res) => {
    try {
        // populate para preencher os campos virtuais
        const autores = await Artista.find()
            .populate('cds')
            .populate('adicionadoPor', 'username')
            .populate('alteradoPor', 'username');
            
        res.json(autores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET (Buscar por ID) - Público (sem authenticate também)
// (Observação: esse :id é como uma variavel, diz que essa rota (/) vai receber um dado (req.params.id))
router.get('/:id', async (req, res) => {
    try {
        const artista = await Artista.findById(req.params.id)
            .populate('cds')
            .populate('adicionadoPor', 'username')
            .populate('alteradoPor', 'username');
            
        if (!artista) return res.status(404).json({ message: 'Artista não encontrado' });
        res.json(artista);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// "authenticate" é uma função middleware que vai garantir que estamos autenticados antes de seguir para o resto da rota
// upload.single('imagem') é uma função middleware do multer, que será usada para enviar a imagem para o Cloudinary (ela altera um pouco como os dados são enviados)
router.put('/:id', authenticate, upload.single('imagem'), async (req, res) => {
    try {
        // Essa parte faz algo diferente de simplesmente "const dados = req.body;": o uso das reticencias (ellipsis operator) pega as informações/itens/dados de algo (nesse caso, req.body) e "espalha" isso no que estivermos usando (pode ser um array, objeto, função, etc). Aqui, ela "espalha" o que estiver dentro de req.body para dentro de dados. "const dados = req.body;" criaria quase que um apelido para req.body, chamado "dados", e não é o que queremos aqui. 
        const dados = { ...req.body };

        // Se enviou uma nova imagem, faz o upload e atualiza o campo urlFoto
        if (req.file) {
            const result = await uploadStream(req.file.buffer);
            dados.urlFoto = result.secure_url;
        }

        // Tenta converter os campos como JSON
        const camposArray = ['genero', 'autores', 'volumes', 'faixas', 'nomeAlt'];

        camposArray.forEach(campo => {
            if (dados[campo]) {
                try {
                    dados[campo] = JSON.parse(dados[campo]);
                } catch (e) {
                    console.warn(`Falha ao converter JSON do campo ${campo} no PUT`);
                }
            }
        });

        if (req.user) {
            dados.alteradoPor = req.user._id;
            dados.dataAlteracao = Date.now();
            
            delete dados.adicionadoPor; 
        }

        // Atualiza no banco
        // "new: true" avisa para o mongoose que queremos a versão atualizada da entrada no banco
        // "runValidators: true" avisa que queremos seguir as regras estabelecidas la nas models
        const artista = await Artista.findByIdAndUpdate(req.params.id, dados, { new: true, runValidators: true });
        
        if (!artista) return res.status(404).json({ message: 'Artista não encontrado' });
        res.json(artista);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); 

// DELETE
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const artista = await Artista.findByIdAndUpdate(
            req.params.id, 
            { ativo: false }, 
            { new: true });
            
        if (!artista) return res.status(404).json({ message: 'Artista não encontrado' });
        res.json({ message: 'Artista deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;