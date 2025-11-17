const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

usuarioSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next();
});

usuarioSchema.methods.comparePassword = function (candidatePassword) {
    return bcryptjs.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);