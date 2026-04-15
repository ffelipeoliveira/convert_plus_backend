require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const convertRoutes = require('./routes/convert.routes');
const { ensureDirectoryExists } = require('./utils/file.utils');
const { uploadDir, convertedDir } = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors());

console.log('Checking directories...');

if (!ensureDirectoryExists(uploadDir) || !ensureDirectoryExists(convertedDir)) {
  console.error('Failed to create required directories. Exiting.');
  process.exit(1);
}

app.use('/convert', convertRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running'
  });
});

module.exports = app;