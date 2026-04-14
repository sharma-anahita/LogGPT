const startWorker = async () => {
  try {
    // Worker bootstrap point for Kafka consumers and processors.
    console.log("Worker started");
  } catch (error) {
    console.error("Worker failed to start:", error);
    process.exit(1);
  }
};

startWorker();
