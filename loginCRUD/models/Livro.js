// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const livroSchema = new Schema ({
    nome: { type: String, required: true },
    genero: [String], // um array simples, varios itens podem estar aqui
    ano: { type: Number },

    // Configurando aqui também a relação dessa coleção com a outra
    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }],

    urlFoto: { type: String }, // aqui vai o link do Cloudinary
    ativo: { type: Boolean, default: true } // como boa pratica, não vou deletar do banco de dados, mas esconder essa entrada
});

module.exports = mongoose.model('Livro', livroSchema);