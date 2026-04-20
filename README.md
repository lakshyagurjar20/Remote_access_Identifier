# Remote Desktop Detector

A lightweight, JavaScript-based tool for detecting running remote desktop applications (like TeamViewer, AnyDesk, RDP) using Process, Network, and Registry checks.

## Project Structure

This project has been fully converted to clean, minimal **Vanilla JavaScript (Node.js)**. No TypeScript or Build steps are required!

*   `src/main.js` - Single PC CLI scanning tool.
*   `src/server.js` - Single PC Web UI scanner.
*   `src/client/index.js` - Node client agent that continuously scans and pushes data to a central admin server.
*   `src/server/centralServer.js` - Central admin server (requires MongoDB) that aggregates data from all client agents.

## Quick Start (Single Machine)

You can run the detector on a single machine without setting up any databases or complex configurations.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Options

**Option A: Single Console Scan**  
Run a single immediate check and output to the terminal:
```bash
npm start
```

**Option B: Continuous Console Monitoring**  
Run a check every 5 seconds (configurable) and keep the terminal open:
```bash
npm run monitor
```

**Option C: Local Web Dashboard**  
Start a local web server to view the scan results in a browser interface:
```bash
npm run ui
```
*Then open `http://localhost:3000` in your browser.*

---

## Enterprise Mode (Client / Server)

If you want to deploy the scanner across multiple computers and monitor them from a central dashboard, use the Client/Server mode.

### 1. Start the Central Admin Server
The central server requires **MongoDB**. Ensure MongoDB is running locally on port `27017` or update `MONGO_URI` in your environment.

```bash
npm run server
```
*Wait for the server to start, then open the Admin Dashboard at `http://localhost:8082/admin/dashboard.html`*

### 2. Start the Client Agents
On any PC you want to monitor, run the client agent. It will continuously scan and ping the Central Server.

```bash
# To point to your central server, you can set the SERVER_URL variable:
# $env:SERVER_URL="http://<Central-Server-IP>:8082" 

npm run client
```

## How It Works

The tool relies on three core detectors (`src/detectors/`):
1.  **Process Detector**: Uses `ps-list` to check currently active processes against an allowed list.
2.  **Network Detector**: Uses `tcp-port-used` and native `netstat`/`tasklist` to find open Remote Desktop ports (e.g. 5938, 3389).
3.  **Registry Detector**: Uses `registry-js` to scan the Windows registry for installed remote access software (Windows only).

You can add or remove recognized threats by editing `src/config/settings.js`.
