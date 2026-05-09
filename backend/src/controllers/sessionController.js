const pool = require("../config/database");

exports.createSession = async (req, res) => {
  try {
    const { name, config } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ error: "Session name is required" });

    const result = await pool.query(
      `INSERT INTO sessions (user_id, name, status, config)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, status, config, created_at, updated_at`,
      [userId, name, "processing", config ? JSON.stringify(config) : null]
    );

    console.log(`[API] Session created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.status,
         s.config,
         s.created_at,
         s.updated_at,
         COUNT(DISTINCT l.id)::int  AS log_count,
         COUNT(DISTINCT a.id)::int  AS anomaly_count
       FROM sessions s
       LEFT JOIN logs l ON s.id = l.session_id
       LEFT JOIN anomalies a ON s.id = a.session_id
       WHERE s.user_id = $1
       GROUP BY s.id, s.name, s.status, s.config, s.created_at, s.updated_at
       ORDER BY s.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.status,
         s.config,
         s.created_at,
         s.updated_at,
         COUNT(DISTINCT l.id)::int  AS log_count,
         COUNT(DISTINCT a.id)::int  AS anomaly_count
       FROM sessions s
       LEFT JOIN logs l ON s.id = l.session_id
       LEFT JOIN anomalies a ON s.id = a.session_id
       WHERE s.id = $1 AND s.user_id = $2
       GROUP BY s.id, s.name, s.status, s.config, s.created_at, s.updated_at`,
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

exports.getSessionLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT id, timestamp, level, service, message
       FROM logs
       WHERE session_id = $1 AND user_id = $2
       ORDER BY timestamp DESC
       LIMIT $3 OFFSET $4`,
      [id, userId, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching session logs:", error);
    res.status(500).json({ error: "Failed to fetch session logs" });
  }
};

exports.getSessionAnomalies = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT
         id,
         type,
         severity,
         start_time,
         end_time,
         description,
         -- Pull confidence out of the metadata JSONB column
         COALESCE((metadata->>'confidence')::float, 0.75) AS confidence,
         created_at
       FROM anomalies
       WHERE session_id = $1 AND user_id = $2
       ORDER BY start_time DESC
       LIMIT $3 OFFSET $4`,
      [id, userId, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching session anomalies:", error);
    res.status(500).json({ error: "Failed to fetch session anomalies" });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    if (!status) return res.status(400).json({ error: "Status is required" });

    const result = await pool.query(
      `UPDATE sessions
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, status, config, created_at, updated_at`,
      [status, id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      "DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    res.json({ message: "Session deleted", id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
};