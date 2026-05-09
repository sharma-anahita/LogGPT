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

    // Drop existing tables in reverse dependency order
    await pool.query("DROP TABLE IF EXISTS anomalies CASCADE;");
    await pool.query("DROP TABLE IF EXISTS logs CASCADE;");
    await pool.query("DROP TABLE IF EXISTS sessions CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    console.log("[✓] Dropped existing tables");

    // Users table (NEW - for authentication)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[✓] Table 'users' created");

    // Sessions table (MODIFIED - added user_id)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'processing',
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[✓] Table 'sessions' created");

    // Logs table (MODIFIED - added user_id for query efficiency)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        level VARCHAR(50),
        service VARCHAR(255),
        message TEXT,
        raw TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[✓] Table 'logs' created");

    // Anomalies table (MODIFIED - added user_id)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        type VARCHAR(100),
        severity VARCHAR(50),
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[✓] Table 'anomalies' created");

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs (user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs (session_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_service ON logs (service);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON anomalies (user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anomalies_session_id ON anomalies (session_id);
    `);

    console.log("[✓] All tables and indexes created");
    console.log("\n[✓] Database initialized successfully!");
    await pool.end();
  } catch (error) {
    console.error("[ERROR] Database initialization failed:", error.message);
    process.exit(1);
  }
};

initDB();