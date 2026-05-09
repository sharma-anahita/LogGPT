const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadLogs } = require("../controllers/logController");

const router = express.Router();

// All log routes require authentication
router.use(authMiddleware);

router.post("/upload", uploadLogs);

module.exports = router;
