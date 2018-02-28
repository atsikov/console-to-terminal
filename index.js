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

const app = express();
app.use(cors());

app.post("/writeConsoleMessage", (req, res) => {
    const buffer = [];
    req
        .on("data", chunk => buffer.push(chunk))
        .on("end", () => {
            let color;
            let icon = "";
            switch (req.query.type) {
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
                icon + JSON.parse(Buffer.concat(buffer).toString()).join(",")
            ));
        });
    res.send("OK");
});

app.get("/demo", (req, res) => {
    res.sendFile(path.join(__dirname, "demo", "index.html"));
});

let scriptContents;
app.get("/console-hook.js", (req, res) => {
    if (!scriptContents) {
        scriptContents = fs.readFileSync(
            path.join(__dirname, "scripts", "console-hook.js")
        )
            .toString()
            .replace(/(const serverHost = ).*;/, `$1"${host}";`)
            .replace(/(const serverPort = ).*;/, `$1${port};`);
    }

    res.send(scriptContents);
});

app.listen(port, host, () => {
    console.log(`ConsoleToTerminal is running on ${chalk.green(`${host}:${port}`)}`);
});
