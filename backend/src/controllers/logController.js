const { parseLogs } = require("./src/utils/logParser");

exports.uploadLogs = async (req,res) =>{
    const { logs, service } = req.body;
    if(!logs || !Array.isArray(logs)){
        return res.status(400).json({ error: "Logs must be an array" });
    }
    const parsedLogs = parseLogs(logs,service);

    //  send parsed logs to json 
    console.log(parsedLogs);
    res.json({
        message : "Logs uploaded successfully",
        parsedLogs : parsedLogs
    });
};