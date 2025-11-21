const express = require('express');
const router = express.Router();
const Dvd = require('../models/Dvd');
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
        const camposArray = ['genero', 'autores', 'volumes', 'faixas']; // Lista de campos que podem ser arrays no seu sistema

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

        const dvd = new Dvd(dados);
        await dvd.save();
        res.status(201).json(dvd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const dvds = await Dvd.find({ ativo: true }).populate('autor');
        res.json(dvds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.2: GET (Buscar por ID) - Público
router.get('/:id', async (req, res) => {
    try {
        const dvd = await Dvd.findById(req.params.id);
        if (!dvd) return res.status(404).json({ message: 'Dvd não encontrado' });
        res.json(dvd);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.3: PUT (Atualizar) - Protegido
router.put('/:id', authenticate, async (req, res) => {
    try {
        const dvd = await Dvd.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!dvd) return res.status(404).json({ message: 'Dvd não encontrado' });
        res.json(dvd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.3: DELETE (Deletar) - Protegido
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const dvd = await Dvd.findByIdAndUpdate(
            req.params.id, 
            { ativo: false }, 
            { new: true });

        if (!dvd) return res.status(404).json({ message: 'Dvd não encontrado' });
        res.json({ message: 'Dvd deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;