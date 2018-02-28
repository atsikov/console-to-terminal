const { log, warn, error, info, trace } = window.console;
const reChromeErrorPrefix = /^Error\:\s*/;
const customLocation = window["__consoleToTerminalLocation__"];

const { host, protocol = "http:" } = customLocation || location;
const serverHost = host.split(":")[0];
const serverPort = customLocation && customLocation.port || 8765;
const serverHostWithPort = `${serverHost}:${serverPort}`;
const serverUrl = `${protocol}//${serverHostWithPort}/writeConsoleMessage`;

function prepareData(...rest) {
    return [...rest].map((el) => 
        typeof el === "object" && el.constructor.name === "Object" ? JSON.stringify(el) : el
    );
}

function makeRequest(messageType, ...rest) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${serverUrl}?type=${messageType}`);
    xhr.send(JSON.stringify(prepareData(...rest)));
}

window.console.log = function(...rest) {
    log(...rest);
    makeRequest("log", ...rest);
}
window.console.warn = function(...rest) {
    warn(...rest);
    makeRequest("warn", ...rest);
}
window.console.error = function(...rest) {
    error(...rest);
    makeRequest("error", ...rest);
}
window.console.info = function(...rest) {
    info(...rest);
    makeRequest("info", ...rest);
}
window.console.trace = function() {
    trace();
    const stack = new Error("console.trace").stack
    makeRequest("trace", stack.replace(reChromeErrorPrefix, ""));
}

console.info(`Navigated to ${location.href}\n`);
