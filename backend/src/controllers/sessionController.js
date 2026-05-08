const pool = require("../config/database");

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { name, config } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Session name is required" });
    }

    const query = `
      INSERT INTO sessions (name, status, config)
      VALUES ($1, $2, $3)
      RETURNING id, name, status, config, created_at, updated_at
    `;

    const result = await pool.query(query, [
      name,
      "processing",
      config ? JSON.stringify(config) : null,
    ]);

    console.log(`[API] Session created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
};

// Get all sessions with aggregated stats
exports.getSessions = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.status, 
        s.config, 
        s.created_at, 
        s.updated_at,
        COUNT(DISTINCT l.id) as log_count,
        COUNT(DISTINCT a.id) as anomaly_count
      FROM sessions s
      LEFT JOIN logs l ON s.id = l.session_id
      LEFT JOIN anomalies a ON s.id = a.session_id
      GROUP BY s.id, s.name, s.status, s.config, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// Get session by ID with stats
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.status, 
        s.config, 
        s.created_at, 
        s.updated_at,
        COUNT(DISTINCT l.id) as log_count,
        COUNT(DISTINCT a.id) as anomaly_count
      FROM sessions s
      LEFT JOIN logs l ON s.id = l.session_id
      LEFT JOIN anomalies a ON s.id = a.session_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.status, s.config, s.created_at, s.updated_at
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

// Get logs for a session with pagination
exports.getSessionLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    const query = `
      SELECT 
        l.id,
        l.timestamp,
        l.level,
        l.service,
        l.message
      FROM logs l
      WHERE l.session_id = $1
      ORDER BY l.timestamp DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [id, limit, offset]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching session logs:", error);
    res.status(500).json({ error: "Failed to fetch session logs" });
  }
};

// Get anomalies for a session
exports.getSessionAnomalies = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const offset = parseInt(req.query.offset) || 0;

    const query = `
      SELECT 
        a.id,
        a.type,
        a.severity,
        a.start_time,
        a.end_time,
        a.description,
        a.metadata,
        a.created_at
      FROM anomalies a
      WHERE a.session_id = $1
      ORDER BY a.start_time DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [id, limit, offset]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching session anomalies:", error);
    res.status(500).json({ error: "Failed to fetch session anomalies" });
  }
};

// Update session status
exports.updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const query = `
      UPDATE sessions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, status, config, created_at, updated_at
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
};

// Delete session (cascades to logs, anomalies)
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM sessions WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted", id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
};
