const { log, warn, error, info, trace } = window.console;
const reChromeErrorPrefix = /^Error\:\s*/;

const { host, protocol } = window["__consoleToTerminalLocation__"] || location;
// These consts will be changed while serving file
const serverHost = host.split(":")[0];
const serverPort = 8765;
// End of changeable consts
const serverHostWithPort = `${serverHost}:${serverPort}`;
const serverUrl = `${protocol}//${serverHostWithPort}/writeConsoleMessage`;

function prepareData(...rest) {
    return [...rest].map((el) => 
        typeof el === "object" && el.constructor.name === "Object" ? JSON.stringify(el) : el
    );
}

function makeRequest(messageType, ...rest) {
    fetch(
        `${serverUrl}?type=${messageType}`,
        {
            method: "POST",
            body: JSON.stringify(prepareData(...rest)),
        },
    ).catch((e) => error(e));
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
