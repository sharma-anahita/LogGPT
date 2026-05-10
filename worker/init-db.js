require("dotenv").config({ path: "../.env" });
const { Pool } = require("pg");

if (!process.env.DATABASE_URL && !process.env.POSTGRES_HOST) {
  console.error("[FATAL] Set DATABASE_URL or POSTGRES_HOST before running init-db");
  process.exit(1);
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
    });

const initDB = async () => {
  try {
    console.log("[✶] Initializing database...");

    await pool.query("DROP TABLE IF EXISTS anomalies CASCADE;");
    await pool.query("DROP TABLE IF EXISTS logs CASCADE;");
    await pool.query("DROP TABLE IF EXISTS sessions CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    console.log("[✓] Dropped existing tables");

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

    // user_id is NULLABLE here — ML service detects anomalies without a user context
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    console.log("[✓] Table 'anomalies' created (user_id nullable)");

    // Indexes
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);",
      "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);",
      "CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs (user_id);",
      "CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs (session_id);",
      "CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp);",
      "CREATE INDEX IF NOT EXISTS idx_anomalies_session_id ON anomalies (session_id);",
    ];
    for (const idx of indexes) {
      await pool.query(idx);
    }
    console.log("[✓] Indexes created");
    console.log("[✓] Database initialized successfully!");
    await pool.end();
  } catch (error) {
    console.error("[ERROR] Database initialization failed:", error.message);
    process.exit(1);
  }
};

initDB();