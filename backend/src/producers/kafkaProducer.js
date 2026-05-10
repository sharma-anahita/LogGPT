require("dotenv").config();
const { Kafka } = require("kafkajs");

// KAFKA_BROKER is the single source of truth across all services
// On Render internal network: e.g. kafka-service:9092
const brokerUrl = process.env.KAFKA_BROKER;
if (!brokerUrl) {
  throw new Error("KAFKA_BROKER environment variable is required");
}

const kafka = new Kafka({
  clientId: "loggpt-backend",
  brokers: [brokerUrl],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

let isConnected = false;
let connectPromise = null;

const connectProducer = async () => {
  if (isConnected) return;
  // Prevent concurrent connection attempts
  if (connectPromise) return connectPromise;

  connectPromise = producer
    .connect()
    .then(() => {
      isConnected = true;
      connectPromise = null;
      console.log("[✓] Kafka Producer connected to", brokerUrl);
    })
    .catch((err) => {
      connectPromise = null;
      isConnected = false;
      throw err;
    });

  return connectPromise;
};

const sendLogsToKafka = async (logs) => {
  try {
    await connectProducer();

    const messages = logs.map((log) => ({
      value: JSON.stringify(log),
    }));

    await producer.send({
      topic: "logs-topic",
      messages,
    });

    console.log(`[Kafka] Sent ${logs.length} logs to topic 'logs-topic'`);
  } catch (error) {
    console.error("[Kafka] Producer Error:", error.message);
    // Reset connection state so next call retries
    isConnected = false;
    throw error;
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (isConnected) {
    await producer.disconnect();
  }
});

module.exports = { sendLogsToKafka };