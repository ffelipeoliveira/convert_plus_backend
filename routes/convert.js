const express = require('express');
const multer = require('multer');
const { txtToPdf } = require('../controllers/convertController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/txt-to-pdf', upload.single('file'), txtToPdf);

module.exports = router;
