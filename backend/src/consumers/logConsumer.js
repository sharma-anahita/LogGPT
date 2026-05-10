require("dotenv").config();
const { Kafka } = require("kafkajs");
const pool = require("../config/database"); // reuse backend's existing DB pool

const brokerUrl = process.env.KAFKA_BROKER;
if (!brokerUrl) {
  throw new Error("KAFKA_BROKER environment variable is required");
}

const kafka = new Kafka({
  clientId: "loggpt-worker",
  brokers: [brokerUrl],
  retry: {
    initialRetryTime: 1000,
    retries: 15,
  },
  connectionTimeout: 15000,
  requestTimeout: 30000,
});

const consumer = kafka.consumer({
  groupId: "loggpt-worker-group",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
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
  return result.rows[0];
};

const startConsumer = async () => {
  let retries = 0;
  const maxRetries = 15;

  while (retries < maxRetries) {
    try {
      await consumer.connect();
      console.log("[✓] Kafka Consumer connected to", brokerUrl);

      await consumer.subscribe({ topic: "logs-topic", fromBeginning: true });
      console.log("[✓] Subscribed to logs-topic");

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const log = JSON.parse(message.value.toString());
            const label = log.sessionId ? `session ${log.sessionId}` : "no session";
            console.log(`[KAFKA] Message from ${label}: ${String(log.message).slice(0, 80)}`);
            await saveLog(log);
            console.log("[DB] Log saved");
          } catch (err) {
            // Bad messages must not crash the consumer
            console.error("[ERROR] Processing message:", err.message);
          }
        },
      });

      return; // connected and running — exit the retry loop
    } catch (err) {
      retries++;
      const waitMs = Math.min(1000 * retries, 15000);
      console.error(
        `[WARN] Kafka Consumer failed to connect (attempt ${retries}/${maxRetries}):`,
        err.message
      );
      if (retries >= maxRetries) {
        console.error("[ERROR] Could not connect to Kafka after max retries. Consumer disabled.");
        return; // don't crash the whole backend — just disable the consumer
      }
      console.log(`[INFO] Retrying consumer in ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
};

module.exports = { startConsumer };