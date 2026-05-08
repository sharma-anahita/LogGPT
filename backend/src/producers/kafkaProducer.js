// backend/src/producers/kafkaProducer.js
require("dotenv").config();
const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "loggpt-backend",
  brokers: [(process.env.KAFKA_BROKER || "localhost:9092")], // change when using docker
});

const producer = kafka.producer();

let isConnected = false;

// Connect producer (only once)
const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("Kafka Producer Connected");
  }
};

// Send logs to Kafka
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

    console.log(`Sent ${logs.length} logs to Kafka`);
  } catch (error) {
    console.error("Kafka Producer Error:", error);
  }
};

module.exports = {
  sendLogsToKafka,
}; 