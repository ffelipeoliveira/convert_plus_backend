const express = require('express');
const multer = require('multer');
const { pdfToDocx } = require('../controllers/convertController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/pdf-to-docx', upload.single('file'), pdfToDocx);

module.exports = router;