const express = require("express");
const router = express.Router();
const convertController = require("../controllers/convert.controller")
const upload = require("../middlewares/upoloadlimit.middleware")
const limit = require("../middlewares/ratelimit.middleware")

router.post("/", limit, upload.single("file"), convertController.convert)

module.exports = router;