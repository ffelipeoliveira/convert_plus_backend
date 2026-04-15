const fs = require('fs');
const path = require('path');
const libre = require('libreoffice-convert');

const { uploadDir, convertedDir } = require('../config/env');

function convertFile(buffer, ext) {
  return new Promise((resolve, reject) => {
    libre.convert(buffer, ext, undefined, (err, done) => {
      if (err) reject(err);
      else resolve(done);
    });
  });
}

exports.handleConversion = async (req) => {
  const file = req.file;
  const format = req.query.format;

  if (!file || !format) {
    throw new Error('Missing file or format');
  }

  const inputPath = path.resolve(file.path);
  const outputExt = '.' + format;

  const outputFilename =
    path.basename(file.filename, path.extname(file.filename)) + outputExt;

  const outputPath = path.join(convertedDir, outputFilename);

  console.log('📥 Input file:', inputPath);
  console.log('📤 Output file:', outputPath);

  // leitura do arquivo
  const buffer = fs.readFileSync(inputPath);
  console.log('📦 Input buffer size:', buffer.length);

  // conversão
  const converted = await convertFile(buffer, outputExt);

  console.log('🔄 Converted buffer size:', converted?.length);

  // validação importante
  if (!converted || converted.length === 0) {
    throw new Error('Conversion returned empty file');
  }

  // escrita do arquivo convertido
  fs.writeFileSync(outputPath, converted);

  console.log('File written:', outputPath);
  console.log('File exists:', fs.existsSync(outputPath));

  return {
    inputPath,
    outputPath,
    filename: `converted${outputExt}`
  };
};

exports.cleanup = ({ inputPath, outputPath }) => {
  [inputPath, outputPath].forEach((file) => {
    try {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log('🧹 Deleted:', file);
      }
    } catch (err) {
      console.error('❌ Cleanup error:', err.message);
    }
  });
};

exports.handleError = async (error) => {
  console.error('❌ Conversion error:', error.message);
};

exports.testDirectories = () => {
  return {
    status: 'ok',
    uploadDir,
    convertedDir,
    uploadExists: fs.existsSync(uploadDir),
    convertedExists: fs.existsSync(convertedDir)
  };
};