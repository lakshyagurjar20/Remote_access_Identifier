import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { SessionMonitor } from "./monitors/sessionMonitor";
import { ScanResult } from "./types";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const sessionMonitor = new SessionMonitor();

// State management
let isMonitoring = false;
let monitoringInterval: NodeJS.Timeout | null = null;
let clients: Response[] = [];

/**
 * Serve the main HTML page
 */
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/**
 * Start continuous monitoring
 */
app.post("/api/start-monitoring", async (req: Request, res: Response) => {
  if (isMonitoring) {
    return res.json({ success: false, message: "Monitoring already running" });
  }

  isMonitoring = true;

  // Start periodic scanning
  const runScan = async () => {
    if (!isMonitoring) return;

    try {
      const result = await sessionMonitor.runScan();
      broadcastToClients(result);
    } catch (error) {
      console.error("Scan error:", error);
    }
  };

  // Run first scan immediately
  runScan();

  // Then run every 5 seconds
  monitoringInterval = setInterval(runScan, 5000);

  res.json({ success: true, message: "Monitoring started" });
});

/**
 * Stop continuous monitoring
 */
app.post("/api/stop-monitoring", (req: Request, res: Response) => {
  if (!isMonitoring) {
    return res.json({ success: false, message: "Monitoring not running" });
  }

  stopMonitoring();

  res.json({ success: true, message: "Monitoring stopped" });
});

/**
 * Helper function to stop monitoring
 */
function stopMonitoring() {
  isMonitoring = false;

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Run a single scan
 */
app.get("/api/scan-once", async (req: Request, res: Response) => {
  try {
    const result = await sessionMonitor.runScan();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * Get monitoring status
 */
app.get("/api/status", (req: Request, res: Response) => {
  res.json({ isMonitoring });
});

/**
 * Server-Sent Events endpoint for real-time updates
 */
app.get("/api/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Add this client to the list
  clients.push(res);

  // Remove client when connection closes
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);

    // If no clients are connected, stop monitoring
    if (clients.length === 0 && isMonitoring) {
      console.log("All clients disconnected. Stopping monitoring...");
      stopMonitoring();
    }
  });
});

/**
 * Broadcast scan results to all connected clients
 */
function broadcastToClients(result: ScanResult) {
  const data = JSON.stringify(result);
  clients.forEach((client) => {
    client.write(`data: ${data}\n\n`);
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`\n🌐 Remote Desktop Detector UI is running!`);
  console.log(`📊 Open your browser at: http://localhost:${PORT}`);
  console.log(`\n🔍 Features:`);
  console.log(`   - Real-time continuous detection`);
  console.log(`   - Start/Stop monitoring button`);
  console.log(`   - Live detection alerts\n`);
});
