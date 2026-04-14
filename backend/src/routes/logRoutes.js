const express = require("express");
const { uploadLogs } = require("../controllers/logController");

const router = express.Router();

router.post("/upload", uploadLogs);

module.exports = router;
