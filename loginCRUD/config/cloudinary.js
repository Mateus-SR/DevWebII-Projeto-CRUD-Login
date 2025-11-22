const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

console.log("Tentando configurar Cloudinary. URL:", process.env.CLOUDINARY_URL ? "Encontrada" : "NÃO ENCONTRADA");

// Configurando a conexão com o CLoudinary (process.env puxa uma variavel de ambiente que ta la no vercel)
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
        secure: true
    });
} else {
    // failsafe, caso a autenticação de cima falhe ou algo do tipo aconteça
    cloudinary.config({
        secure: true
    });
}

const uploadStream = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                // Configuração pro Cloudinary processar a imagme e otimizar ela
                folder: "loginCRUD",
                transformation: [
                    { width: 500, crop: "scale" },
                    { quality: "auto:best" },
                    { fetch_format: "auto" }
                ]
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

module.exports = { uploadStream };