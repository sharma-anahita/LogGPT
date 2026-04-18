// worker/init-db.js
// Run this once: node init-db.js

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "loggpt",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "loggpt",
  password: process.env.POSTGRES_PASSWORD || "loggpt",
  port: process.env.POSTGRES_PORT || 5432,
});

const initDB = async () => {
  try {
    console.log("[\u2731] Initializing database...");

    // Create logs table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        level VARCHAR(50),
        service VARCHAR(255),
        message TEXT,
        raw TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timestamp (timestamp),
        INDEX idx_service (service)
      );
    `;

    await pool.query(createTableQuery);
    console.log("[\u2713] Table 'logs' created successfully");

    // Clear existing logs for fresh test
    await pool.query("DELETE FROM logs;");
    console.log("[\u2713] Cleared existing logs");

    console.log("\n[\u2713] Database initialized successfully!");
    console.log("Ready for testing. Run: npm start\n");

    await pool.end();
  } catch (error) {
    console.error("[ERROR] Database initialization failed:", error.message);
    process.exit(1);
  }
};

initDB();
