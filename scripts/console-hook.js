const { log, warn, error, info, trace } = window.console;
const reChromeErrorPrefix = /^Error\:\s*/;

const { host, protocol } = window["__consoleToTerminalLocation__"] || location;
// These consts will be changed while serving file
const serverHost = host.split(":")[0];
const serverPort = 8765;
// End of changeable consts
const serverHostWithPort = `${serverHost}:${serverPort}`;
const serverUrl = `${protocol}//${serverHostWithPort}/writeConsoleMessage`;

function getConsoleFormData(...rest) {
    const formData = new FormData();
    [...rest].forEach((el, idx) => {
        const elType = typeof el;
        if (
            elType === "number" ||
            elType === "string" ||
            elType === "boolean"
        ) {
            formData.append(`param${idx}`, el.toString());
        } else if (typeof el === "Array") {
            formData.append(`param${idx}`, el.join(","));
        } else {
            formData.append(`param${idx}`, JSON.stringify(el));
        }
    });

    return formData;
}

function makeRequest(messageType, ...rest) {
    const messagePayload = getConsoleFormData(...rest);
    fetch(
        `${serverUrl}?type=${messageType}`,
        {
            method: "POST",
            body: messagePayload,
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
