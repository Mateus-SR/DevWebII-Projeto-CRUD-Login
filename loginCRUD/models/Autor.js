const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const autorSchema = new Schema({
    nome: { type: String, required: true },
    nacionalidade: { type: String },
    urlFoto: { type: String },
    ativo: { type: Boolean, default: true }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

autorSchema.virtual('cds', {
    ref: 'Cd',
    localField: '_id',
    foreignField: 'autor'
});

autorSchema.virtual('hqs', {
    ref: 'HQ',
    localField: '_id',
    foreignField: 'autores'
});

autorSchema.virtual('dvds', {
    ref: 'Dvd',
    localField: '_id',
    foreignField: 'autor'
});

autorSchema.virtual('livros', {
    ref: 'Livro',
    localField: '_id',
    foreignField: 'autores'
});

module.exports = mongoose.model('Autor', autorSchema);