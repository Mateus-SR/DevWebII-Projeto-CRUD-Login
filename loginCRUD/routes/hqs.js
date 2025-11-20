const express = require('express');
const router = express.Router();
const Hq = require('../models/Hq');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, async (req, res) => {
    try {
        const hq = new Hq(req.body);
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
router.put('/:id', authenticate, async (req, res) => {
    try {
        const hq = await Hq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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