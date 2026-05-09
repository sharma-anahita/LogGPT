const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSession,
  getSessions,
  getSessionById,
  getSessionLogs,
  getSessionAnomalies,
  updateSessionStatus,
  deleteSession,
} = require("../controllers/sessionController");

const router = express.Router();

// All session routes require authentication
router.use(authMiddleware);

// Session management
router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.get("/:id/logs", getSessionLogs);
router.get("/:id/anomalies", getSessionAnomalies);
router.patch("/:id/status", updateSessionStatus);
router.delete("/:id", deleteSession);

module.exports = router;
