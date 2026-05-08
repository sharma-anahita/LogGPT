require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { Pool } = require("pg");

console.log("process.env.POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("process.env.POSTGRES_HOST:", process.env.POSTGRES_HOST);
console.log("process.env.POSTGRES_DB:", process.env.POSTGRES_DB);
console.log("process.env.POSTGRES_PASSWORD:", process.env.POSTGRES_PASSWORD);
console.log("process.env.POSTGRES_PORT:", process.env.POSTGRES_PORT);
const pool = new Pool({
  user: process.env.POSTGRES_USER || "loggpt_user",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "loggpt",
  password: process.env.POSTGRES_PASSWORD || "12345678",
  port: process.env.POSTGRES_PORT || 5432,
});

const initDB = async () => {
  try {
    console.log("[✶] Initializing database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        level VARCHAR(50),
        service VARCHAR(255),
        message TEXT,
        raw TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes must be created separately in Postgres
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON logs (timestamp);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service ON logs (service);
    `);

    console.log("[✓] Table 'logs' and indexes created");

    await pool.query("DELETE FROM logs;");
    console.log("[✓] Cleared existing logs");

    console.log("\n[✓] Database initialized successfully!");
    await pool.end();
  } catch (error) {
    console.error("[ERROR] Database initialization failed:", error.message);
    process.exit(1);
  }
};

initDB();