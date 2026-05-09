const express = require("express");
require("dotenv").config();
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const pool = require("../config/database");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.LLM_MODEL || "llama3-8b-8192";

// All summary routes require authentication
router.use(authMiddleware);

router.post("/:id/summary", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch session
    const sessionResult = await pool.query(
      `SELECT s.id, s.name, s.status,
              COUNT(DISTINCT l.id)::int AS log_count,
              COUNT(DISTINCT a.id)::int AS anomaly_count
       FROM sessions s
       LEFT JOIN logs l ON s.id = l.session_id
       LEFT JOIN anomalies a ON s.id = a.session_id
       WHERE s.id = $1 AND s.user_id = $2
       GROUP BY s.id, s.name, s.status`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    const session = sessionResult.rows[0];

    // Fetch recent logs (cap at 60)
    const logsResult = await pool.query(
      `SELECT level, service, message
       FROM logs
       WHERE session_id = $1 AND user_id = $2
       ORDER BY timestamp DESC
       LIMIT 60`,
      [id, userId]
    );

    // Fetch anomalies
    const anomaliesResult = await pool.query(
      `SELECT type, severity, description,
              COALESCE((metadata->>'confidence')::float, 0.75) AS confidence
       FROM anomalies
       WHERE session_id = $1 AND user_id = $2
       ORDER BY start_time DESC`,
      [id, userId]
    );

    const logs = logsResult.rows;
    const anomalies = anomaliesResult.rows;

    const logLines = logs
      .map(l => `[${(l.level || "INFO").toUpperCase()}] ${l.service} — ${l.message}`)
      .join("\n") || "No logs yet.";

    const anomalyLines = anomalies.length
      ? anomalies
          .map(
            a =>
              `• ${a.type} (${a.severity}, ${Math.round((a.confidence ?? 0.75) * 100)}% confidence): ${a.description}`
          )
          .join("\n")
      : "No anomalies detected.";

    const prompt = `You are an expert SRE analyzing a log session called "${session.name}".

SESSION STATS:
- Total logs: ${session.log_count}
- Anomalies found: ${session.anomaly_count}
- Status: ${session.status}

RECENT LOGS (newest first):
${logLines}

DETECTED ANOMALIES:
${anomalyLines}

Write a concise incident summary (3–5 sentences) covering:
1. What is happening in this session
2. The likely root cause (if determinable from the logs)
3. Recommended immediate actions

Be direct and specific. Reference actual service names and error patterns from the logs above.`;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured on server" });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.3,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[Groq] API error:", errText);
      return res.status(502).json({ error: "Groq API request failed", detail: errText });
    }

    const groqData = await groqRes.json();
    const summary = groqData.choices?.[0]?.message?.content?.trim() ?? "No summary available.";

    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

module.exports = router;