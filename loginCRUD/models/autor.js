const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const autorSchema = new Schema({
    nome: { type: String, required: true },
    nacionalidade: { type: String },
    obras: { type: String }
});

module.exports = mongoose.model('Autor', autorSchema);