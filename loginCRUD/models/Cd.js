const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cdSchema = new Schema ({
    titulo: { type: String, required: true },
    tipo: { type: String, required: true },
    genero: { type: String },
    faixas: [{ 
        titulo: String,
        duracao: String
     }],
    duracaoTotal: { type: Number },
    ano: { type: Number },

     faixasTotal: { type: Number, default: 0 },

    autor: { type: Schema.Types.ObjectId, ref: 'Autor', required: true },
    urlFoto: { type: String },
    ativo: { type: Boolean, default: true }
});

cdSchema.pre('save', function(next) {
    this.faixasTotal = this.faixas.length;
    next();
});

module.exports = mongoose.model('Cd', cdSchema);