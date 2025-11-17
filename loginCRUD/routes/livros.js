const express = require('express');
const router = express.Router();
const Livro = require('../models/Livro');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, async (req, res) => {
    try {
        const livro = new Livro(req.body);
        await livro.save();
        res.status(201).json(livro);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const livros = await Livro.find().populate('Autor');
        res.json(livros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.2: GET (Buscar por ID) - Público
router.get('/:id', async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json(livro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.3: PUT (Atualizar) - Protegido
router.put('/:id', authenticate, async (req, res) => {
    try {
        const livro = await Livro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json(livro);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.3: DELETE (Deletar) - Protegido
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const livro = await Livro.findByIdAndDelete(req.params.id);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;