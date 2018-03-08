"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _window$console = window.console,
    log = _window$console.log,
    warn = _window$console.warn,
    error = _window$console.error,
    info = _window$console.info,
    trace = _window$console.trace;

var reChromeErrorPrefix = /^Error\:\s*/;
var customLocation = window["__consoleToTerminalLocation__"];

var _ref = customLocation || location,
    host = _ref.host,
    _ref$protocol = _ref.protocol,
    protocol = _ref$protocol === undefined ? "http:" : _ref$protocol;

var serverHost = host.split(":")[0];
var serverPort = customLocation && customLocation.port || 8765;
var serverHostWithPort = serverHost + ":" + serverPort;
var serverUrl = protocol + "//" + serverHostWithPort + "/writeConsoleMessage";
var processRequestsTimeout = 0;
var pendingRequests = [];

function prepareData() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
    }

    return [].concat(rest).map(function (el) {
        return (typeof el === "undefined" ? "undefined" : _typeof(el)) === "object" && el.constructor.name === "Object" ? JSON.stringify(el) : el;
    });
}

function sendMessage(type) {
    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        rest[_key2 - 1] = arguments[_key2];
    }

    pendingRequests.push({
        type: type,
        message: [].concat(rest)
    });
    if (!processRequestsTimeout) {
        processRequestsTimeout = setTimeout(processRequests, 0);
    }
}

function processRequests() {
    processRequestsTimeout = 0;

    var payload = pendingRequests.map(function (_ref2) {
        var type = _ref2.type,
            message = _ref2.message;
        return {
            type: type,
            message: prepareData.apply(undefined, _toConsumableArray(message))
        };
    });
    pendingRequests = [];

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "" + serverUrl);
    xhr.send(JSON.stringify(payload));
}

window.console.log = function () {
    for (var _len3 = arguments.length, rest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        rest[_key3] = arguments[_key3];
    }

    log.apply(undefined, rest);
    sendMessage.apply(undefined, ["log"].concat(rest));
};
window.console.warn = function () {
    for (var _len4 = arguments.length, rest = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        rest[_key4] = arguments[_key4];
    }

    warn.apply(undefined, rest);
    sendMessage.apply(undefined, ["warn"].concat(rest));
};
window.console.error = function () {
    for (var _len5 = arguments.length, rest = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        rest[_key5] = arguments[_key5];
    }

    error.apply(undefined, rest);
    sendMessage.apply(undefined, ["error"].concat(rest));
};
window.console.info = function () {
    for (var _len6 = arguments.length, rest = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        rest[_key6] = arguments[_key6];
    }

    info.apply(undefined, rest);
    sendMessage.apply(undefined, ["info"].concat(rest));
};
window.console.trace = function () {
    trace();
    var stack = new Error("console.trace").stack;
    sendMessage("trace", stack.replace(reChromeErrorPrefix, ""));
};

console.info("Navigated to " + location.href + "\n");