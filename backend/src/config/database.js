require("dotenv").config(require("path").resolve(__dirname, "../../.env"));
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "loggpt",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "loggpt",
  password: process.env.POSTGRES_PASSWORD || "loggpt",
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on("connect", () => {
  console.log("[✓] Backend database connection established");
});

pool.on("error", (err) => {
  console.error("[ERROR] Backend database connection error:", err.message);
});

module.exports = pool;
