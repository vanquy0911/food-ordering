const express = require('express');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpg|jpeg|png|webp|gif/;
        const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/gif/;

        const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    },
});

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // req.file.path contains the Cloudinary URL when using multer-storage-cloudinary
    res.send(req.file.path);
});

module.exports = router;

// module.exports = router;