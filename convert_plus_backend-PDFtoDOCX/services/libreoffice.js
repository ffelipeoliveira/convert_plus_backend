const {exec} = require('child_process');
const path = require('path');

function convertTxtToPdf(inputPath, outputDir){
    return new Promise((resolve, reject) =>  {
        const command = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(stderr || error.message));
            }

            const outputFile = path.join(
                outputDir,
                path.basename(inputPath, path.extname(inputPath))+'.pdf'
            );

            resolve(outputFile);
        });
    });
}

module.exports = {
    convertTxtToPdf
}