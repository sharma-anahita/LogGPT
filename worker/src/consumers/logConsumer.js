const { Kafka } = require("kafkajs");
const { saveLog } = require("../services/dbService.js");

const kafka = new Kafka({
  clientId: "loggpt-worker",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "loggpt-group" });

const startConsumer = async () => {
  try {
    await consumer.connect();
    console.log("[✓] Kafka Consumer Connected");
    
    await consumer.subscribe({ topic: "logs-topic", fromBeginning: true });
    console.log("[✓] Subscribed to logs-topic");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const logs = JSON.parse(message.value.toString());
          const sessionId = logs.sessionId ? `session ${logs.sessionId}` : "no session";
          console.log(`[KAFKA] Received message from ${sessionId}:`, logs.message);
          
          await saveLog(logs);
          console.log("[DB] ✓ Log saved to database");
        } catch (error) {
          console.error("[ERROR] Processing log message:", error.message);
        }
      },
    });
  } catch (error) {
    console.error("[ERROR] Kafka Consumer Error:", error.message);
    process.exit(1);
  }
};

module.exports = {
  startConsumer,
};
