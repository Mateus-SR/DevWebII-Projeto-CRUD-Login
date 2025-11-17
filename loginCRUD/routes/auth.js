const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Rota de Registro (POST /auth/register)
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = new Usuario({ username, password });
        await usuario.save();
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao registrar usuário', details: error.message });
    }
});

// Rota de Login (POST /auth/login)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = await Usuario.findOne({ username });

        if (!usuario || !(await usuario.comparePassword(password))) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        // Se o login for válido, crie o token JWT
        const payload = { id: usuario._id, username: usuario.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

module.exports = router;