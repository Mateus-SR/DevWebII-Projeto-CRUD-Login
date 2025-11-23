// SCHEMAS - o molde que o banco de dados vai usar para criar novas entradas
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cdSchema = new Schema ({
    titulo: { type: String, required: true },
    tipo: { type: String, required: true },
    genero: { type: String },
    faixas: [{ 
        titulo: String,
        duracao: String
        // isso é campo com mais de uma informação (no caso, um array de objetos)
     }],
    duracaoTotal: { type: Number },
    ano: { type: Number },

     faixasTotal: { type: Number, default: 0 },

    // Configurando aqui também a relação dessa coleção com a outra
    artista: { type: Schema.Types.ObjectId, ref: 'Artista', required: true },
    
    urlFoto: { type: String }, // aqui vai o link do Cloudinary
    ativo: { type: Boolean, default: true } // como boa pratica, não vou deletar do banco de dados, mas esconder essa entrada
});

// Essa é uma função middleware, que é executada antes ("pre") de algo acontecer (nesse caso, a ação de salvar ("save"))
cdSchema.pre('save', function(next) {
    // O que acontece aqui:
    // Contamos quantas faixas existem, e dizemos que esse número é que deve ir para faixasTotal
    this.faixasTotal = this.faixas.length;
    next(); // e prosseguimos pra proxima função
});

cdSchema.pre('findOneAndUpdate', function(next) { // roda sempre que atualiza no banco
    const update = this.getUpdate(); // pega o que foi atualizado

    if (update.faixas) { // e se houver alguma atualização no total de faixas, então atualiza ele
        update.faixasTotal = update.faixas.length;
    }
    next();
});
module.exports = mongoose.model('Cd', cdSchema);