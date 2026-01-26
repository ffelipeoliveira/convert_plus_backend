const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const archiver = require('archiver');

const execFileAsync = promisify(execFile);

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
const libreConvert = promisify(libre.convert);

if (!fs.existsSync('converted')) {
  fs.mkdirSync('converted', { recursive: true });
}

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

app.post('/image-to-pdf', upload.any(), async (req, res) => {
  const file = req.files && req.files[0];

  if (!file) {
    return res.status(400).send('Missing image file.');
  }

  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp'
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    fs.unlinkSync(file.path);
    return res.status(400).send('Invalid file type. Only images are allowed.');
  }

  const inputPath = path.resolve(file.path);
  const outputExt = '.pdf';
  const outputPath = path.join('converted', `${file.filename}${outputExt}`);

  try {
    const imgBuffer = fs.readFileSync(inputPath);
    const convertedBuf = await libreConvert(imgBuffer, outputExt, undefined);

    fs.writeFileSync(outputPath, convertedBuf);

    res.download(outputPath, `image-converted.pdf`, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error('Image->PDF conversion error:', err);

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    res.status(500).send('Image to PDF conversion failed.');
  }
});

app.post('/pdf-to-image', (req, res) => {
  const uploadHandler = upload.any();
  
  uploadHandler(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).send(`Upload error: ${err.message}`);
    }

    console.log('Received files:', req.files);

    const file = req.files?.[0];

    if (!file) {
      return res.status(400).send('Missing PDF file.');
    }

    if (file.mimetype !== 'application/pdf') {
      fs.unlinkSync(file.path);
      return res.status(400).send('Invalid file type. Only PDF is allowed.');
    }

    const inputPath = path.resolve(file.path);
    const outputExt = '.png';
    const outputPath = path.join('converted', `${file.filename}${outputExt}`);

    try {
      const pdfBuffer = fs.readFileSync(inputPath);
      const convertedBuf = await libreConvert(pdfBuffer, outputExt, undefined);

      fs.writeFileSync(outputPath, convertedBuf);

      res.download(outputPath, `pdf-converted.png`, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } catch (err) {
      console.error('PDF->Image conversion error:', err);

      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      res.status(500).send('PDF to Image conversion failed.');
    }
  });
});

app.post('/pdf-to-images', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('Missing PDF file.');
  }

  if (file.mimetype !== 'application/pdf') {
    fs.unlinkSync(file.path);
    return res.status(400).send('Invalid file type. Only PDF is allowed.');
  }

  const inputPath = path.resolve(file.path);
  const outputDir = path.join('converted', file.filename);
  const zipPath = path.join('converted', `${file.filename}.zip`);

  let imageFiles = [];

  const cleanup = () => {
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      if (fs.existsSync(outputDir)) {
        fs.readdirSync(outputDir).forEach(f =>
          fs.unlinkSync(path.join(outputDir, f))
        );
        fs.rmdirSync(outputDir);
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  };

  try {
    fs.mkdirSync(outputDir, { recursive: true });

    
    await execFileAsync('pdftoppm', [
      '-png',
      inputPath,
      path.join(outputDir, 'page')
    ]);

    imageFiles = fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.png'))
      .sort();

    if (imageFiles.length === 0) {
      throw new Error('No images generated.');
    }

    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    imageFiles.forEach((fileName, index) => {
      archive.file(
        path.join(outputDir, fileName),
        { name: `page-${index + 1}.png` }
      );
    });

    await archive.finalize();

    output.on('close', () => {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=images.zip'
      );

      res.download(zipPath, 'images.zip', () => {
        cleanup();
      });
    });

  } catch (err) {
    console.error('PDF → ZIP error:', err);
    cleanup();
    res.status(500).json({ success: false, error: 'PDF to ZIP failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
