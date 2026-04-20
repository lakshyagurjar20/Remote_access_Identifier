const express = require("express");
const cors = require("cors");
const path = require("path");
const { SessionMonitor } = require("./monitors/sessionMonitor");

const app = express();
const PORT = 3000;
const sessionMonitor = new SessionMonitor();

let isMonitoring = false;
let monitoringInterval = null;
let clients = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/api/start-monitoring", async (req, res) => {
  if (isMonitoring) {
    return res.json({ success: false, message: "Monitoring already running" });
  }

  isMonitoring = true;

  const runScan = async () => {
    if (!isMonitoring) return;
    try {
      const result = await sessionMonitor.runScan();
      broadcastToClients(result);
    } catch (error) {
      console.error("Scan error:", error);
    }
  };

  runScan();
  monitoringInterval = setInterval(runScan, 5000);
  res.json({ success: true, message: "Monitoring started" });
});

app.post("/api/stop-monitoring", (req, res) => {
  if (!isMonitoring) {
    return res.json({ success: false, message: "Monitoring not running" });
  }
  stopMonitoring();
  res.json({ success: true, message: "Monitoring stopped" });
});

app.get("/api/scan-once", async (req, res) => {
  try {
    const result = await sessionMonitor.runScan();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get("/api/status", (req, res) => {
  res.json({ isMonitoring });
});

// Server-Sent Events for real-time push updates to the browser
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
    if (clients.length === 0 && isMonitoring) {
      console.log("All clients disconnected. Stopping monitoring...");
      stopMonitoring();
    }
  });
});

function stopMonitoring() {
  isMonitoring = false;
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

function broadcastToClients(result) {
  const data = JSON.stringify(result);
  clients.forEach((client) => client.write(`data: ${data}\n\n`));
}

app.listen(PORT, () => {
  console.log(`\n Remote Desktop Detector UI is running!`);
  console.log(` Open your browser at: http://localhost:${PORT}\n`);
});
