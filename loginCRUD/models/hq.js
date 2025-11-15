const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hqSchema = new Schema ({
    nome: { type: String, require: true },
    nomeAlt: { type: String },
    tipo: { type: String, require: true },
    genero: [String],
    volumes: [{ 
        titulo: String,
        volume: Number,
        emEstoque: Boolean 
     }],

    volumeTotal: { type: Number, default: 1 },

    autores: [{ type: Schema.Types.ObjectId, ref: 'Autor', required: true }]
});

hqSchema.pre('save', function(next) {
    this.volumeTotal = this.volumes.length;
    next();
});

module.exports = mongoose.model('HQ', hqSchema);