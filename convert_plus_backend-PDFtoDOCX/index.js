const express = require('express');
const convertRoutes = require('./routes/convert');

const app = express();

app.use('/convert', convertRoutes);

app.get('/health', (req, res) => res.send('OK'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});