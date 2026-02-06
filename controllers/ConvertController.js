const fs = require('fs')
const path = require('path')
const libre = require('libreoffice-convert')
const { promisify } = require('util')
const { execFile } = require('child_process')
const archiver = require('archiver')

const libreConvert = promisify(libre.convert)
const execFileAsync = promisify(execFile)

module.exports = class ConvertController {

  static async convert(req, res) {
    const file = req.file
    const format = req.query.format

    if (!file || !format) {
      return res.status(400).json({ message: 'Arquivo ou formato ausente.' })
    }

    const inputPath = path.resolve(file.path)
    const outputExt = '.' + format
    const outputPath = path.join('converted', `${file.filename}${outputExt}`)

    try {
      const buffer = fs.readFileSync(inputPath)
      const converted = await libreConvert(buffer, outputExt, undefined)

      fs.writeFileSync(outputPath, converted)

      res.download(outputPath, `converted${outputExt}`, () => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Erro na conversão.' })
    }
  }

  
  static async imageToPdf(req, res) {
    const file = req.files?.[0]

    if (!file) {
      return res.status(400).json({ message: 'Imagem ausente.' })
    }

    const inputPath = path.resolve(file.path)
    const outputPath = path.join('converted', `${file.filename}.pdf`)

    try {
      const buffer = fs.readFileSync(inputPath)
      const converted = await libreConvert(buffer, '.pdf', undefined)

      fs.writeFileSync(outputPath, converted)

      res.download(outputPath, 'image.pdf', () => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      })
    } catch (err) {
      res.status(500).json({ message: 'Erro ao converter imagem.' })
    }
  }

  
  static async pdfToImage(req, res) {
    const file = req.files?.[0]

    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'PDF inválido.' })
    }

    const inputPath = path.resolve(file.path)
    const outputPath = path.join('converted', `${file.filename}.png`)

    try {
      const buffer = fs.readFileSync(inputPath)
      const converted = await libreConvert(buffer, '.png', undefined)

      fs.writeFileSync(outputPath, converted)

      res.download(outputPath, 'pdf.png', () => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      })
    } catch (err) {
      res.status(500).json({ message: 'Erro ao converter PDF.' })
    }
  }


  static async pdfToImages(req, res) {
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: 'PDF ausente.' })
    }

    const inputPath = path.resolve(file.path)
    const outputDir = path.join('converted', file.filename)
    const zipPath = path.join('converted', `${file.filename}.zip`)

    try {
      fs.mkdirSync(outputDir, { recursive: true })

      await execFileAsync('pdftoppm', [
        '-png',
        inputPath,
        path.join(outputDir, 'page')
      ])

      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip')

      archive.pipe(output)

      fs.readdirSync(outputDir).forEach((img, i) => {
        archive.file(
          path.join(outputDir, img),
          { name: `page-${i + 1}.png` }
        )
      })

      await archive.finalize()

      output.on('close', () => {
        res.download(zipPath, 'images.zip', () => {
          fs.rmSync(outputDir, { recursive: true, force: true })
          fs.unlinkSync(inputPath)
          fs.unlinkSync(zipPath)
        })
      })

    } catch (err) {
      res.status(500).json({ message: 'Erro ao gerar ZIP.' })
    }
  }

  
  static async pdfToDocx(req, res) {
    const file = req.file

    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'PDF inválido.' })
    }

    const inputPath = path.resolve(file.path)
    const outputPath = path.join('converted', `${file.filename}.docx`)

    try {
      await execFileAsync('python3', [
        '/usr/local/bin/convert_pdf2docx.py',
        inputPath,
        outputPath
      ])

      res.download(outputPath, 'converted.docx', () => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      })
    } catch (err) {
      res.status(500).json({ message: 'Erro ao converter PDF para DOCX.' })
    }
  }
}
