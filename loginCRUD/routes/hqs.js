const express = require('express');
const router = express.Router();
const Hq = require('../models/Hq');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

const multer = require('multer');
const { uploadStream } = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, upload.single('imagem'), async (req, res) => {
    try {
        // 1. "Espalha" todos os campos de texto que vieram (nome, tipo, ano, etc.)
        // Isso evita ter que digitar um por um!
        const dados = { ...req.body };

        // 2. Lógica da Imagem (Só adiciona se existir arquivo)
        if (req.file) {
            const result = await uploadStream(req.file.buffer);
            dados.urlFoto = result.secure_url;
        }

        // 3. Converter campos "Array" que vieram como JSON String
        // O front-end manda arrays como string "[...]" via FormData.
        // O Mongoose precisa de Arrays reais. Vamos converter automaticamente:
        const camposArray = ['genero', 'autores', 'volumes', 'faixas', 'nomeAlt']; // Lista de campos que podem ser arrays no seu sistema

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

        const hq = new Hq(dados);
        await hq.save();
        res.status(201).json(hq);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const hqs = await Hq.find().populate('autores');
        res.json(hqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.2: GET (Buscar por ID) - Público
router.get('/:id', async (req, res) => {
    try {
        const hq = await Hq.findById(req.params.id);
        if (!hq) return res.status(404).json({ message: 'Hq não encontrado' });
        res.json(hq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.3: PUT (Atualizar) - Protegido
router.put('/:id', authenticate, upload.single('imagem'), async (req, res) => {
    try {
        // 1. Copia o corpo da requisição
        const dados = { ...req.body };

        // 2. Se enviou uma nova imagem, faz o upload e atualiza o campo urlFoto
        if (req.file) {
            const result = await uploadStream(req.file.buffer);
            dados.urlFoto = result.secure_url;
        }

        // 3. Converte os campos que vêm como JSON String (mesma lógica do POST)
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

        // 4. Atualiza no banco
        const hq = await Hq.findByIdAndUpdate(req.params.id, dados, { new: true, runValidators: true });
        
        if (!hq) return res.status(404).json({ message: 'Hq não encontrado' });
        res.json(hq);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.3: DELETE (Deletar) - Protegido
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const hq = await Hq.findByIdAndDelete(req.params.id);
        if (!hq) return res.status(404).json({ message: 'Hq não encontrado' });
        res.json({ message: 'Hq deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;