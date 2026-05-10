require("dotenv").config();
const { Kafka } = require("kafkajs");
const { saveLog } = require("../services/dbService.js");

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

const startConsumer = async () => {
  let retries = 0;
  const maxRetries = 10;

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
            const sessionLabel = log.sessionId ? `session ${log.sessionId}` : "no session";
            console.log(`[KAFKA] Message from ${sessionLabel}: ${log.message?.slice(0, 80)}`);

            await saveLog(log);
            console.log("[DB] Log saved");
          } catch (error) {
            console.error("[ERROR] Processing message:", error.message);
            // Don't rethrow — bad messages should not crash the consumer
          }
        },
      });

      return; // success
    } catch (error) {
      retries++;
      const waitMs = Math.min(1000 * retries, 15000);
      console.error(
        `[ERROR] Kafka Consumer connection failed (attempt ${retries}/${maxRetries}):`,
        error.message
      );
      if (retries >= maxRetries) {
        console.error("[FATAL] Max retries reached. Exiting.");
        process.exit(1);
      }
      console.log(`[INFO] Retrying in ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("[INFO] Shutting down worker consumer...");
  await consumer.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

module.exports = { startConsumer };