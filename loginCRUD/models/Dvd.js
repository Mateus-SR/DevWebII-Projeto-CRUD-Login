const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dvdSchema = new Schema ({
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    genero: { type: String },
    duracao: { type: Number },
    ano: { type: Number },

    autor: { type: Schema.Types.ObjectId, ref: 'Autor', required: true },
    urlFoto: { type: String },
    ativo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Dvd', dvdSchema);