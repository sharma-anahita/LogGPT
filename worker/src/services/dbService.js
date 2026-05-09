require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "loggpt",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "loggpt",
  password: process.env.POSTGRES_PASSWORD || "loggpt",
  port: process.env.POSTGRES_PORT || 5432,
});

// Test connection
pool.on("connect", () => {
  console.log("[✓] Database connection established");
});

pool.on("error", (err) => {
  console.error("[ERROR] Database connection error:", err.message);
});

const saveLog = async (log) => {
  try {
    const query = `
      INSERT INTO logs (user_id, session_id, timestamp, level, service, message, raw)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      log.userId || null,
      log.sessionId || null,
      log.timestamp,
      log.level,
      log.service,
      log.message,
      log.raw,
    ];

    const result = await pool.query(query, values);
    console.log("[DB] Inserted log with ID:", result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error("[ERROR] Database insert failed:", error.message);
    throw error;
  }
};

// Save anomaly
const saveAnomaly = async (sessionId, anomaly, userId) => {
  try {
    const query = `
      INSERT INTO anomalies (user_id, session_id, type, severity, start_time, end_time, description, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      userId || null,
      sessionId,
      anomaly.type,
      anomaly.severity,
      anomaly.startTime,
      anomaly.endTime,
      anomaly.description,
      JSON.stringify(anomaly.metadata || {}),
    ];

    const result = await pool.query(query, values);
    console.log("[DB] Inserted anomaly with ID:", result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error("[ERROR] Anomaly insert failed:", error.message);
    throw error;
  }
};

module.exports = { saveLog, saveAnomaly };