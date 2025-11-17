const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hqSchema = new Schema ({
    nome: { type: String, required: true },
    nomeAlt: [String],
    tipo: { type: String, required: true },
    genero: [String],
    volumes: [{ 
        titulo: { type: String, required: true },
        tituloAlt: { type: String },
        volume: { type: Number, required: true },
        emEstoque: { type: Boolean, required: true } 
     }],

    volumeTotal: { type: Number, default: 0 },

    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }]
});

hqSchema.pre('save', function(next) {
    this.volumeTotal = this.volumes.length;
    next();
});

module.exports = mongoose.model('HQ', hqSchema);