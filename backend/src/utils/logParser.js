const LEVELS = ["INFO","DEBUG","WARN","ERROR"]

function isJSON(log){
    try{
        JSON.parse(log);
        return true;
    }
    catch{
        return false;
    }
}

function parseJSONLog(log,service="unknown"){
    const parsed = JSON.parse(log);
    const lowerCaseParsed = {};
    for(let key in parsed){
        lowerCaseParsed[key.toLowerCase()] = parsed[key];
    }
    return {    
        timestamp : lowerCaseParsed.timestamp ? new Date(lowerCaseParsed.timestamp).toISOString() : new Date().toISOString(),
        level : lowerCaseParsed.level ? lowerCaseParsed.level : "INFO",
        service : lowerCaseParsed.service ? lowerCaseParsed.service : service,  
        message : log,
        raw : log
    };
}
function extractTimeStamp(log){
    const regex = /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/;
    const match = log.match(regex);
    return match ? new Date(match[0]).toISOString() : new Date().toISOString();
}
function extractLevel(log){
    for(let level of LEVELS){
        if(log.includes(level)) return level;
    }
    return "INFO";
}
function parseTextLog(log,service){
    return {
        timestamp : extractTimeStamp(log),
        level : extractLevel(log),
        message : log,
        raw : log,
        service : service
    }
}
function parseLogs(logs,service ="unknown"){
    return logs.map((log) =>{
        // case 1: parse json object
        if(typeof log === "object"){
            return parseJSONLog(JSON.stringify(log),service);
        }
        // a json object
        if(isJSON(log)){
            return parseJSONLog(log,service);
        }
        // a text log
        return parseTextLog(log,service);
    })
}


module.exports = {
    parseLogs
};
// is my parser working correctly?
// answer me please
// To test if your log parser is working correctly, you can run the `testParser.js` file. It will use the `parseLogs` function to parse a set of test logs and print the results to the console.

// You can run the test by executing the following command in your terminal:    

