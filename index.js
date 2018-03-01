const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const rePort = /^\d+$/;
const reHostPort = /^([a-zA-Z0-9.-_]+)\:(\d+)$/;

let host = "localhost";
let port = 8765;
const customHostPort = process.argv[2];
if (customHostPort) {
    if (customHostPort.match(rePort)) {
        port = parseInt(customHostPort);
    } else if (parsed = customHostPort.match(reHostPort)) {
        host = parsed[1];
        port = parsed[2];
    } else {
        console.error(chalk.red(`
Argument Error: "${customHostPort}" couldn't be matched as <port> or <host>:<port>!
Usage examples: "yarn start", "yarn start 1234", "yarn start hostname:1234"
`));
        process.exit(1);
    }
}

function outputMessage(request) {
    const { type, message } = request;
    let color;
    let icon = "";
    switch (type) {
        case "log":
            color = chalk.white;
            break;
        case "warn":
            color = chalk.yellow;
            icon = "⚠️  ";
            break;
        case "error":
            color = chalk.red;
            icon = "🚫  ";
            break;
        case "info":
            color = chalk.blueBright;
            icon = "ℹ️  ";
            break;
        default:
            color = chalk;
    }
    console.log(color(
        icon + message.join(",")
    ));
}

const app = express();
app.use(cors());

app.post("/writeConsoleMessage", (req, res) => {
    const buffer = [];
    req
        .on("data", chunk => buffer.push(chunk))
        .on("end", () => {
            const payload = JSON.parse(Buffer.concat(buffer).toString());
            payload.forEach(outputMessage);
        });
    res.send("OK");
});

app.get("/demo", (req, res) => {
    res.sendFile(path.join(__dirname, "demo", "index.html"));
});

let scriptContents;
app.get("/console-hook.js", (req, res) => {
    if (!scriptContents) {
        scriptContents = `
            window["__consoleToTerminalLocation__"] = ${JSON.stringify({ host, port })};
            ${fs.readFileSync(
                path.join(__dirname, "dist", "console-hook.js")
            ).toString()}
        `;
    }

    res.send(scriptContents);
});

app.listen(port, host, () => {
    console.log(`ConsoleToTerminal is running on ${chalk.green(`${host}:${port}`)}`);
});
