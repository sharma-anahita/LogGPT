require("dotenv").config();
const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

pool.on("connect", () => {
  console.log("[✓] Worker DB connection established");
});

pool.on("error", (err) => {
  console.error("[ERROR] Worker DB error:", err.message);
});

const saveLog = async (log) => {
  const query = `
    INSERT INTO logs (user_id, session_id, timestamp, level, service, message, raw)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  const values = [
    log.userId || null,
    log.sessionId || null,
    log.timestamp || new Date().toISOString(),
    log.level || "info",
    log.service || "unknown",
    log.message || "",
    log.raw || "",
  ];

  const result = await pool.query(query, values);
  console.log("[DB] Inserted log id:", result.rows[0].id);
  return result.rows[0];
};

const saveAnomaly = async (sessionId, anomaly, userId) => {
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
  return result.rows[0];
};

module.exports = { saveLog, saveAnomaly };