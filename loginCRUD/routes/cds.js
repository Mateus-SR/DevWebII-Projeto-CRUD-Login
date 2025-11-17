const express = require('express');
const router = express.Router();
const Cd = require('../models/Cd');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

// 5.3: POST (Criar) - Protegido
router.post('/', authenticate, async (req, res) => {
    try {
        const cd = new Cd(req.body);
        await cd.save();
        res.status(201).json(cd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.2: GET (Listar) - Público
router.get('/', async (req, res) => {
    try {
        const cds = await Cd.find().populate('autor');
        res.json(cds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.2: GET (Buscar por ID) - Público
router.get('/:id', async (req, res) => {
    try {
        const cd = await Cd.findById(req.params.id);
        if (!cd) return res.status(404).json({ message: 'Cd não encontrado' });
        res.json(cd);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5.3: PUT (Atualizar) - Protegido
router.put('/:id', authenticate, async (req, res) => {
    try {
        const cd = await Cd.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cd) return res.status(404).json({ message: 'Cd não encontrado' });
        res.json(cd);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5.3: DELETE (Deletar) - Protegido
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const cd = await Cd.findByIdAndDelete(req.params.id);
        if (!cd) return res.status(404).json({ message: 'Cd não encontrado' });
        res.json({ message: 'Cd deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;