const express = require('express');
const router = express.Router();
const Autor = require('../models/Autor');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, async (req, res) => {
    try {
        const autor = new Autor(req.body);
        await autor.save();
        res.status(201).json(autor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const autores = await Autor.find();
        res.json(autores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.2: GET (Buscar por ID) - Público
router.get('/:id', async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        if (!autor) return res.status(404).json({ message: 'Autor não encontrado' });
        res.json(autor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.3: PUT (Atualizar) - Protegido
router.put('/:id', authenticate, async (req, res) => {
    try {
        const autor = await Autor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!autor) return res.status(404).json({ message: 'Autor não encontrado' });
        res.json(autor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.3: DELETE (Deletar) - Protegido
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const autor = await Autor.findByIdAndDelete(req.params.id);
        if (!autor) return res.status(404).json({ message: 'Autor não encontrado' });
        res.json({ message: 'Autor deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;