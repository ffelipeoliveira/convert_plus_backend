const path = require('path');

module.exports = {
  uploadDir: path.join(__dirname, '../../uploads'),
  convertedDir: path.join(__dirname, '../../converted'),
  PORT: process.env.PORT,
  RATE_LIMIT: process.env.RATE_LIMIT,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE
};