const convertService = require("../services/convert.service");
const fs = require("fs");

exports.convert = async(req, res) => {
    try {
        const format = req.query.format
        const result = await convertService.handleConversion(req);
        res.download(result.outputPath, result.filename, async (err) => {
            if (err) {
                console.error('download error: ', err)
            }
            try {
                if (result.inputPath) {
                    await fs.promises.unlink(result.inputPath);
                }

                if (result.outputPath) {
                    await fs.promises.unlink(result.outputPath);
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