const { log, warn, error, info, trace } = window.console;
const reChromeErrorPrefix = /^Error\:\s*/;
const customLocation = window["__consoleToTerminalLocation__"];

const { host, protocol = "http:" } = customLocation || location;
const serverHost = host.split(":")[0];
const serverPort = customLocation && customLocation.port || 8765;
const serverHostWithPort = `${serverHost}:${serverPort}`;
const serverUrl = `${protocol}//${serverHostWithPort}/writeConsoleMessage`;
let processRequestsTimeout = 0;
let pendingRequests = [];

function prepareData(...rest) {
    return [...rest].map(el => 
        typeof el === "object" && el.constructor.name === "Object" ? JSON.stringify(el) : el
    );
}

function sendMessage(type, ...rest) {
    pendingRequests.push({
        type,
        message: [...rest],
    });
    if (!processRequestsTimeout) {
        processRequestsTimeout = setTimeout(processRequests, 0);
    }
}

function processRequests() {
    processRequestsTimeout = 0;

    const payload = pendingRequests.map(({ type, message }) => ({
        type,
        message: prepareData(...message),
    }));
    pendingRequests = [];

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${serverUrl}`);
    xhr.send(JSON.stringify(payload));
}

window.console.log = function(...rest) {
    log(...rest);
    sendMessage("log", ...rest);
}
window.console.warn = function(...rest) {
    warn(...rest);
    sendMessage("warn", ...rest);
}
window.console.error = function(...rest) {
    error(...rest);
    sendMessage("error", ...rest);
}
window.console.info = function(...rest) {
    info(...rest);
    sendMessage("info", ...rest);
}
window.console.trace = function() {
    trace();
    const stack = new Error("console.trace").stack
    sendMessage("trace", stack.replace(reChromeErrorPrefix, ""));
}

console.info(`Navigated to ${location.href}\n`);
