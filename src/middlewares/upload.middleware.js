const multer = require('multer');
const path = require('path');
const { uploadDir } = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.random();
    cb(null, unique + path.extname(file.originalname));
  }
});

module.exports = multer({ storage });