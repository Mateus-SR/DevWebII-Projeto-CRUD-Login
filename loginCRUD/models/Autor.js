// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const autorSchema = new Schema({
    nome: { type: String, required: true },
    nacionalidade: { type: String },
    urlFoto: { type: String }, // aqui vai o link do Cloudinary
    ativo: { type: Boolean, default: true }, // como boa pratica, não vou deletar do banco de dados, mas esconder essa entrada

    adicionadoPor: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario' // Conecta com o model Usuario
    },
    alteradoPor: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario' 
    },
    dataCriacao: { type: Date, default: Date.now },
    dataAlteracao: { type: Date }
}, {
    // Aqui, os "campos virtuais" são configurados
    // Campos virtuais são uma especie de dados ficticios, imaginarios, que podemos ter no banco.
    // Em outras palavras, eles são como as relações de um banco de dados relacional, dizemos que os dados do schema pertencem/se relacionam/tem haver com os dados de outra coleção("tabela") do banco
    toJSON: { virtuals: true }, // significa campos "ficticios" vão aparecer quando transformmarmos um item do banco em json
    toObject: { virtuals: true } // significa campos "ficticios" vão aparecer quando transformmarmos um item do banco em objeto
});

/*
Os campos virtuais:
    ref: 'nome da models', // Na models "tal"...
    localField: '_id', // ... "sabe o campo _id daqui? Então... "
    foreignField: 'campoDaRelação' // "... ele tem relação com esse campo de lá" 
*/
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