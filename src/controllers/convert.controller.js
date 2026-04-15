const convertService = require('../services/convert.service');
const fs = require('fs');

exports.convert = async (req, res) => {
  try {
    const result = await convertService.handleConversion(req);

    res.download(result.outputPath, result.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }

      // atraso para garantir envio
      setTimeout(() => {
        try {
          if (result.inputPath && fs.existsSync(result.inputPath)) {
            fs.unlinkSync(result.inputPath);
            console.log('Cleaned up input file:', result.inputPath);
          }

          if (result.outputPath && fs.existsSync(result.outputPath)) {
            fs.unlinkSync(result.outputPath);
            console.log('Cleaned up output file:', result.outputPath);
          }

        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
      }, 3000);
    });

  } catch (error) {
    console.error('Conversion error:', error);

    res.status(500).json({
      error: 'File conversion failed',
      details: error.message
    });
  }
};

exports.test = (req, res) => {
    const result = require('../services/convert.service').testDirectories();
    res.json(result);
}