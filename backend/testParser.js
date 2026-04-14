const { parseLogs } = require("./src/utils/logParser.js")

const testLogs = [
    "2024-06-01T12:00:00Z INFO Service started successfully",
    "2024-06-01T12:01:00Z WARN High memory usage detected",
    "2024-06-01T12:02:00Z ERROR Failed to connect to database",
    JSON.stringify({
        tempstamp: "2024-06-01T12:03:00Z",
        Level: "DEBUG",
        Service: "auth-service",
        Message: "User login attempt"
    })
]

const parsedLogs = parseLogs(testLogs,"test-service");
console.log(parsedLogs);