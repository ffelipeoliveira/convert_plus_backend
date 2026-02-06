const router = require('express').Router()
const multer = require('multer')

const ConvertController = require('../controllers/ConvertController')

const upload = multer({ dest: 'uploads/' })

router.post('/file', upload.single('file'), ConvertController.convert)
router.post('/image-to-pdf', upload.any(), ConvertController.imageToPdf)
router.post('/pdf-to-image', upload.any(), ConvertController.pdfToImage)
router.post('/pdf-to-images', upload.single('file'), ConvertController.pdfToImages)
router.post('/pdf-to-docx', upload.single('file'), ConvertController.pdfToDocx)

module.exports = router
