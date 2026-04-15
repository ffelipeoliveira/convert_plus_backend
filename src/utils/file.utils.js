const fs = require('fs');

function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch (err) {
    console.error(`Error with directory ${dir}:`, err.message);
    return false;
  }
}

module.exports = { ensureDirectoryExists };