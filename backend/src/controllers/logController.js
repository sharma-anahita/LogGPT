const { parseLogs } = require("../utils/logParser");
const { sendLogsToKafka } = require("../producers/kafkaProducer.js");

exports.uploadLogs = async (req, res) => {
  try {
    const { logs, service } = req.body;
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: "Logs must be an array" });
    }
    const parsedLogs = parseLogs(logs, service);

    //  send parsed logs to kafka
    await sendLogsToKafka(parsedLogs);

    res.json({
      message: "Logs sent to kafka successfully",
      count: parsedLogs.length,
    });
  } catch (error) {
    console.error("Error uploading logs:", error);
    res.status(500).json({ error: "Failed to upload logs" });
  }
};
