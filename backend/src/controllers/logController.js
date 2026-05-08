const { parseLogs } = require("../utils/logParser");
const { sendLogsToKafka } = require("../producers/kafkaProducer.js");
const pool = require("../config/database");

exports.uploadLogs = async (req, res) => {
  try {
    const { logs, service, sessionId, sessionName } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: "Logs must be an array" });
    }

    // Create session if sessionName provided, or use existing sessionId
    let finalSessionId = sessionId;

    if (sessionName && !sessionId) {
      // Create new session
      const sessionQuery = `
        INSERT INTO sessions (name, status, config)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const sessionResult = await pool.query(sessionQuery, [
        sessionName,
        "processing",
        JSON.stringify({ service }),
      ]);
      finalSessionId = sessionResult.rows[0].id;
      console.log(`[Upload] Created session: ${finalSessionId}`);
    } else if (!finalSessionId && sessionName) {
      // If both provided, use sessionId
      console.log(`[Upload] Using provided sessionId: ${finalSessionId}`);
    }

    const parsedLogs = parseLogs(logs, service);

    // Add sessionId to each log for Kafka
    const logsWithSession = parsedLogs.map((log) => ({
      ...log,
      sessionId: finalSessionId || null,
    }));

    // Send logs to kafka with sessionId
    await sendLogsToKafka(logsWithSession);

    res.json({
      message: "Logs sent to kafka successfully",
      sessionId: finalSessionId,
      count: logsWithSession.length,
    });
  } catch (error) {
    console.error("Error uploading logs:", error);
    res.status(500).json({ error: "Failed to upload logs" });
  }
};
