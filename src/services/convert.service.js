const fs = require("fs").promises;
const path = require("path");
const libre = require("libreoffice-convert")
const { promisify } = require("util");
const convertAsync = promisify(libre.convert);
const { uploadDir, convertedDir } = require("../config/config.env")

async function convertFile(bufferFile, ext) {
    try {
        const pdfBuff = await convertAsync(bufferFile, ext, undefined);
        return pdfBuff;
    } catch (error) {
        throw error;
    }
}

exports.handleConversion = async (req, inputPath, outputPath) => {
    const file = req.file;
    const format = req.query.format;
    const outputExt = "." + format;

    if (!file || !format){
        throw new Error("Missing file or format")
    }

    console.log('Input: '+ inputPath);
    console.log('Output: '+ outputPath);

    const inputBuffer = await fs.readFile(inputPath);
    const converted = await convertFile(inputBuffer, outputExt);
    console.log("Converted buffer size: ", converted?.length);

    if (!converted || converted.length === 0 ){
        throw new Error("Conversion returned empty file");
    }
    
    await fs.writeFile(outputPath, converted);
    console.log("File written: ", outputPath);
    const result = `converted${outputExt}`

    return result;
}

