const { log, warn, error, info, trace } = window.console;
const reChromeErrorPrefix = /^Error\:\s*/;

const { host, protocol = "http:" } = scriptLocation || location;
const serverHost = host.split(":")[0];
const serverPort = scriptLocation && scriptLocation.port || 8765;
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

const xmlHttpRequestOpen = XMLHttpRequest.prototype.open;
function processRequests() {
    processRequestsTimeout = 0;

    const payload = pendingRequests.map(({ type, message }) => ({
        type,
        message: prepareData(...message),
    }));
    pendingRequests = [];

    const xhr = new XMLHttpRequest();
    xmlHttpRequestOpen.call(xhr, "POST", `${serverUrl}`);
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
if (showXhr) {
    XMLHttpRequest.prototype.open = function(...args) {
        console.log(`${args[0]} ${args[1]}`);
        xmlHttpRequestOpen.apply(this, args);
    }
}

console.info(`Navigated to ${location.href}\n`);
