require('dotenv').config(); 
const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const cors = require('cors');


const app = express();
const port = process.env.PORT;
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT
});
app.use('/convert', limiter);

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain'
];

function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
    fs.accessSync(dir, fs.constants.W_OK);
    console.log(`Directory is writable: ${dir}`);
    return true;
  } catch (err) {
    console.error(`Error with directory ${dir}:`, err.message);
    return false;
  }
}

console.log('Checking directories...');
if (!ensureDirectoryExists(uploadDir) || !ensureDirectoryExists(convertedDir)) {
  console.error('Failed to create required directories. Exiting.');
  process.exit(1);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE }
});

async function convertFile(inputBuffer, outputExt) {
  return new Promise((resolve, reject) => {
    libre.convert(inputBuffer, outputExt, undefined, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
}

app.post('/convert', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    const file = req.file;
    const format = req.query.format;

    if (!file || !format) {
      return res.status(400).json({ error: 'Missing file or format.' });
    }

    console.log('File received:', {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      format: format
    });

    inputPath = path.resolve(file.path);
    const outputExt = '.' + format;
    const outputFilename = `${path.basename(file.filename, path.extname(file.filename))}${outputExt}`;
    outputPath = path.join(convertedDir, outputFilename);

    console.log('Input path:', inputPath);
    console.log('Output path:', outputPath);

    const docBuffer = fs.readFileSync(inputPath);
    console.log('File read successfully, size:', docBuffer.length);

    console.log('Starting conversion...');
    const convertedBuf = await convertFile(docBuffer, outputExt);
    console.log('Conversion successful, output size:', convertedBuf.length);

    fs.writeFileSync(outputPath, convertedBuf);
    console.log('Output file written successfully');

    // Envia pra download
    res.download(outputPath, `converted${outputExt}`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      try {
        if (inputPath && fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
          console.log('Cleaned up input file:', inputPath);
        }
        if (outputPath && fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.log('Cleaned up output file:', outputPath);
        }
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    });

  } catch (err) {
    console.error('Conversion error:', err);
    
    if (inputPath && fs.existsSync(inputPath)) {
      try {
        fs.unlinkSync(inputPath);
        console.log('Cleaned up input file after error:', inputPath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    }
    
    res.status(500).json({ 
      error: 'File conversion failed',
      details: err.message,
      code: err.code
    });
  }
});
 
app.get('/test', (req, res) => {
  const testFile = path.join(convertedDir, 'test.txt');
  try {
    fs.writeFileSync(testFile, 'Test write operation');
    fs.unlinkSync(testFile);
    res.json({ 
      status: 'ok', 
      message: 'Directories are working properly',
      uploadDir: uploadDir,
      convertedDir: convertedDir,
      uploadDirExists: fs.existsSync(uploadDir),
      convertedDirExists: fs.existsSync(convertedDir)
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Directory write test failed',
      error: err.message,
      uploadDir: uploadDir,
      convertedDir: convertedDir
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Directories:');
  console.log(`  Upload: ${uploadDir}`);
  console.log(`  Converted: ${convertedDir}`);
});