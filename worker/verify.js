// worker/verify.js
// Run this to check if logs are in the database: node verify.js

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "loggpt",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "loggpt",
  password: process.env.POSTGRES_PASSWORD || "loggpt",
  port: process.env.POSTGRES_PORT || 5432,
});

const verify = async () => {
  try {
    console.log("\n========== LOG VERIFICATION ==========\n");

    // Check if table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'logs'
      );
    `;
    const tableCheck = await pool.query(tableCheckQuery);
    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      console.log("[X] Table 'logs' does not exist");
      console.log("    Run: node init-db.js\n");
      await pool.end();
      return;
    }

    console.log("[\u2713] Table 'logs' exists");

    // Count total logs
    const countQuery = "SELECT COUNT(*) as total FROM logs;";
    const countResult = await pool.query(countQuery);
    const totalLogs = countResult.rows[0].total;

    console.log("[\u2713] Total logs in database:", totalLogs);

    // Get recent logs
    const logsQuery = `
      SELECT id, timestamp, level, service, message, created_at
      FROM logs
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const logsResult = await pool.query(logsQuery);

    if (logsResult.rows.length === 0) {
      console.log("\n[?] No logs found in database yet.");
      console.log("    Make sure:");
      console.log("    1. Backend is running (npm start in backend folder)");
      console.log("    2. Worker is running (npm start in worker folder)");
      console.log("    3. PostgreSQL is running");
      console.log("    4. Send a test POST /logs/upload request to backend\n");
    } else {
      console.log("\nRecent logs:");
      console.log("----------------------------------------");
      logsResult.rows.forEach((log, i) => {
        console.log(`\n[${i + 1}] ID: ${log.id}`);
        console.log(`    Service: ${log.service}`);
        console.log(`    Level: ${log.level}`);
        console.log(`    Message: ${log.message}`);
        console.log(`    Timestamp: ${log.timestamp}`);
        console.log(`    Saved at: ${log.created_at}`);
      });
      console.log("\n----------------------------------------");
    }

    console.log("\n========================================\n");
    await pool.end();
  } catch (error) {
    console.error("[ERROR] Verification failed:", error.message);
    process.exit(1);
  }
};

verify();
