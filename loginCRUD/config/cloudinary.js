const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    secure: true
});

// Função Helper de Upload (Continua igual)
const uploadStream = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
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