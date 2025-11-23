// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dvdSchema = new Schema ({
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    genero: { type: String },
    duracao: { type: Number },
    ano: { type: Number },

    // Configurando aqui também a relação dessa coleção com a outra
    autor: { type: Schema.Types.ObjectId, ref: 'Autor', required: true },
    
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
});

module.exports = mongoose.model('Dvd', dvdSchema);