const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cdSchema = new Schema ({
    nome: { type: String, require: true },
    tipo: { type: String, require: true },
    genero: { type: String },
    faixas: [{ 
        titulo: String,
        duracao: Number
     }],
    duracaoTotal: { type: Number },
    ano: { type: Number },

     faixasTotal: { type: Number, default: 1 },

    autor: { type: Schema.Types.ObjectId, ref: 'Autor', required: true }
});

cdSchema.pre('save', function(next) {
    this.faixasTotal = this.faixas.length;
    next();
});

module.exports = mongoose.model('Cd', cdSchema);