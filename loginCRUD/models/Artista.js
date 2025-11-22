const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistaSchema = new Schema({
    nome: { type: String, required: true },
    nacionalidade: { type: String },
    urlFoto: { type: String },
    ativo: { type: Boolean, default: true }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

artistaSchema.virtual('cds', {
    ref: 'Cd',
    localField: '_id',
    foreignField: 'artista'
});

module.exports = mongoose.model('Artista', artistaSchema);