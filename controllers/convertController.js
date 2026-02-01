const path = require('path');
const { convertTxtToPdf } = require('../services/libreoffice');

async function txtToPdf(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Arquivo TXT não enviado' });
    }

    const inputPath = path.resolve(file.path);
    const outputDir = path.resolve('converted');

    const pdfPath = await convertTxtToPdf(inputPath, outputDir);

    return res.download(pdfPath, err => {
      if (err) console.error(err);
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao converter TXT para PDF' });
  }
}

module.exports = {
  txtToPdf
};
