// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hqSchema = new Schema ({
    nome: { type: String, required: true },
    nomeAlt: [String], // um array simples, varios itens podem estar aqui
    tipo: { type: String, required: true },
    genero: [String], // um array simples, varios itens podem estar aqui
    volumes: [{ 
        titulo: { type: String },
        tituloAlt: { type: String },
        volume: { type: Number, required: true },
        emEstoque: { type: Boolean, required: true } 
     }],

    volumeTotal: { type: Number, default: 0 },

    // Configurando aqui também a relação dessa coleção com a outra
    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }],

    urlFoto: { type: String }, // aqui vai o link do Cloudinary
    ativo: { type: Boolean, default: true } // como boa pratica, não vou deletar do banco de dados, mas esconder essa entrada
});

hqSchema.pre('save', function(next) {
    this.volumeTotal = this.volumes.length;
    next();
});

module.exports = mongoose.model('HQ', hqSchema);