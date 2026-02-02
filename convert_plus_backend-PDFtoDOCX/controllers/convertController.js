const path = require('path');
const { convertPdfToDocx } = require('../services/pdfConverter');

async function pdfToDocx(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Arquivo PDF não enviado' });
    }

    const inputPath = path.resolve(file.path);
    const outputDir = path.resolve('converted');

    const docxPath = await convertPdfToDocx(inputPath, outputDir);

    return res.download(docxPath, err => {
      if (err) console.error(err);
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro na conversão' });
  }
}

module.exports = { pdfToDocx };