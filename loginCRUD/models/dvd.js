const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dvdSchema = new Schema ({
    nome: { type: String, require: true },
    tipo: { type: String, require: true },
    genero: { type: String },
    duracao: { type: Number },
    ano: { type: Number },

    autor: { type: Schema.Types.ObjectId, ref: 'Autor', required: true }
});

module.exports = mongoose.model('Dvd', dvdSchema);