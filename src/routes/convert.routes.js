const express = require('express');
const router = express.Router();

const convertController = require('../controllers/convert.controller');
const upload = require('../middlewares/upload.middleware')
const limit = require('../middlewares/ratelimit.middleware')

router.post('/', limit, upload.single('file'), convertController.convert);
router.get('/test', convertController.test);

module.exports = router;