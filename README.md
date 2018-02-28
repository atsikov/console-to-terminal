### console-to-terminal
console-to-terminal is a small utility to redirect console output (log, warn, error, info or trace) to the terminal. It is really handy while debugging web applications without a possibility to check console in DevTool (Chrome on iOS or custom "native" browsers on Androids).

### Usage
1. Clone repo and run `yarn` to install dependencies
2. Run `yarn start` to start server. By defaut it is run on `localhost:8765`. Host and port could be modified if server started with `yarn start port` or `yarn start host:port`.
3. Add `<script "http://my-local-ip:port/console-hook.js"></script>` to your web application's entry point. It will install custom hooks for console methods and will make requests to running server.
4. In case you want to load hooks script from your own endpoint, you need to modify `serverHost` and `serverPort` constants in `console-hook.js`.

### Demo
Simply run server as describe in Usage section and navigate to `http://host:port/demo` ([http://localhost:8765/demo]()) by default.
