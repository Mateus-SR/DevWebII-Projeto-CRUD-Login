const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const livroSchema = new Schema ({
    nome: { type: String, require: true },
    genero: [String],
    ano: { type: Number },

    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }]
});

module.exports = mongoose.model('Livro', livroSchema);