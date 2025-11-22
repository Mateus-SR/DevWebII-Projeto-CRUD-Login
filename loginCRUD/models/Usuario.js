// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs'); // para criptografar senhas antes de mandar elas pro bando de dados
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Essa é uma função middleware, que é executada antes ("pre") de algo acontecer (nesse caso, a ação de salvar ("save"))
usuarioSchema.pre('save', async function(next) {
    // O que acontece aqui:
    // Pegamos o input (senha) que foi inserido e antes de salvar no banco criptografamos ela
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next(); // daí mandamos a senha criptografada pro banco e seguimos pra proxima função
});

// O metodo para comparar as senhas e permitir ou bloquear o login
usuarioSchema.methods.comparePassword = function (candidatePassword) {
    // o proprio bcrypt faz a verificação, já que a senha está criptografada (bcryptjs.compare)
    return bcryptjs.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);