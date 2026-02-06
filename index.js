const express = require('express')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

const ConvertRoutes = require('./routes/ConvertRoutes')
app.use('/convert', ConvertRoutes)

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})
