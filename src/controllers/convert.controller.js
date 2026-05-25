const convertService = require("../services/convert.service");
const pdf2DocxPy = require("../scripts/Pdf2Docx")
const { spawn } = require("child_process")
const fs = require("fs");
const path = require("path")

exports.convert = async(req, res) => {
    try {
        const inputPath = file.path;
        const outputExt = "." + format;
        const outputPath = path.join(convertedDir, path.basename(file.filename, path.extname(file.filename)) + outputExt)
        const inputFormat = path.extname(req.file.filename)
        
        if (inputFormat == ".docx" && outputExt == ".pdf"){
            const pythonProcess = spawn("pythhon", [pdf2DocxPy, inputPath, outputPath]);

        }
        
        
        else {
            const result = await convertService.handleConversion(req, inputPath, outputPath);
        }
        res.download(outputPath, result, async (err) => {
            if (err) {
                console.error('download error: ', err)
            }
            try {
                if (inputPath) {
                    await fs.promises.unlink(inputPath);
                }

                if (outputPath) {
                    await fs.promises.unlink(outputPath);
                }
            } catch (error) {
                console.error("Cleanup error: ", error);
            }
            console.log("file downloaded")
        })
    } catch (error) {
        console.error("Conversion error: ", error);
        
        res.status(500).json({
            error: "File conversion failed",
            details: error.message
        })
    }
}