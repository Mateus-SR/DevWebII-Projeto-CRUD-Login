const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Rota de Registro (POST /auth/register)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const usuario = new Usuario({ username, email, password });
        await usuario.save();
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao registrar usuário', details: error.message });
    }
});

// Rota de Login (POST /auth/login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario || !(await usuario.comparePassword(password))) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        // Se o login for válido, crie o token JWT
        const payload = { id: usuario._id, email: usuario.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({ message: 'Login bem-sucedido!', token: token });

    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

module.exports = router;