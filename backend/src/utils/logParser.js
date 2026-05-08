const LEVELS = ["info", "debug", "warn", "error"];

function isJSON(log) {
  try {
    JSON.parse(log);
    return true;
  } catch {
    return false;
  }
}

function parseJSONLog(log, service = "unknown") {
  const parsed = JSON.parse(log);
  const lowerCaseParsed = {};
  for (let key in parsed) {
    lowerCaseParsed[key.toLowerCase()] = parsed[key];
  }
  return {
    timestamp: lowerCaseParsed.timestamp
      ? new Date(lowerCaseParsed.timestamp).toISOString()
      : new Date().toISOString(),
    level: lowerCaseParsed.level
      ? lowerCaseParsed.level.toLowerCase()   
      : "info",
    service: lowerCaseParsed.service ? lowerCaseParsed.service : service,
    message: lowerCaseParsed.message || log,  
    raw: log,
  };
}

function extractTimeStamp(log) {
  const regex = /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/;
  const match = log.match(regex);
  return match ? new Date(match[0]).toISOString() : new Date().toISOString();
}

function extractLevel(log) {
  const upper = log.toUpperCase();
  for (let level of LEVELS) {
    if (upper.includes(level.toUpperCase())) return level; // bug 2 fix: return lowercase
  }
  return "info";
}

function parseTextLog(log, service) {
  return {
    timestamp: extractTimeStamp(log),
    level: extractLevel(log),
    message: log,
    raw: log,
    service: service,
  };
}

function parseLogs(logs, service = "unknown") {
  return logs.map((log) => {
    if (typeof log === "object") {
      return parseJSONLog(JSON.stringify(log), service);
    }
    if (isJSON(log)) {
      return parseJSONLog(log, service);
    }
    return parseTextLog(log, service);
  });
}

module.exports = { parseLogs };