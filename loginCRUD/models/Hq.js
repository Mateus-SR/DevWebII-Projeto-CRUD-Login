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

// Essa é uma função middleware, que é executada antes ("pre") de algo acontecer (nesse caso, a ação de salvar ("save"))
hqSchema.pre('save', function(next) { // roda sempre que salva no banco
    this.volumeTotal = this.volumes.length; // O que acontece aqui:
    // Contamos quantas faixas existem, e dizemos que esse número é que deve ir para faixasTotal
    next(); // e prosseguimos pra proxima função
});

hqSchema.pre('findOneAndUpdate', function(next) { // roda sempre que atualiza no banco
    const update = this.getUpdate(); // pega o que foi atualizado

    if (update.volumes) { // e se houver alguma atualização no total de volumes, então atualiza ele
        update.volumeTotal = update.volumes.length;
    }
    next();
});

module.exports = mongoose.model('HQ', hqSchema);