const express = require('express');
const router = express.Router();
const Dvd = require('../models/Dvd');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, async (req, res) => {
    try {
        const dvd = new Dvd(req.body);
        await dvd.save();
        res.status(201).json(dvd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const dvds = await Dvd.find().populate('autor');
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
        const dvd = await Dvd.findByIdAndDelete(req.params.id);
        if (!dvd) return res.status(404).json({ message: 'Dvd não encontrado' });
        res.json({ message: 'Dvd deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;