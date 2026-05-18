const app = require("./app")
const { PORT } = require("./config/config.env")

app.listen(PORT, () => {
    console.log(`Server is runnning at http://localhost:${PORT}`)
})