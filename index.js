const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
const libreConvert = promisify(libre.convert);

app.post('/convert', upload.single('file'), async (req, res) => {
  const file = req.file;
  const format = req.query.format;

  if (!file || !format) {
    return res.status(400).send('Missing file or format.');
  }

  const inputPath = path.resolve(file.path);
  const outputExt = '.' + format;
  const outputPath = path.join('converted', `${file.filename}${outputExt}`);

  try {
    const docBuffer = fs.readFileSync(inputPath);
    const convertedBuf = await libreConvert(docBuffer, outputExt, undefined);

    fs.writeFileSync(outputPath, convertedBuf);

    res.download(outputPath, `converted${outputExt}`, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).send('File conversion failed.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
þ