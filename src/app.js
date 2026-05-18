const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PORT, uploadDir, convertedDir } = require("./config/config.env")
const convertRoutes = require("./routes/convert.routes")
const { ensureDirectoryExists } = require("./utils/file.utils")

const app = express();

app.use(helmet());
app.use(cors());

console.log('Checking directories...');
if (!ensureDirectoryExists(uploadDir) || !ensureDirectoryExists(convertedDir)) {
  console.error('Failed to create required directories');
  process.exit(1);
}

app.use('/convert', convertRoutes);

app.get("/", (req, res) =>{
    res.json({ 
        message: "API is running"
    });
});

module.exports = app;