import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { MonitoringDatabase } from "./database";
import { ClientReport, ClientStatus } from "./types";

/**
 * CENTRAL SERVER
 * Collects reports from all clients and provides admin API
 */

const app = express();
const db = new MonitoringDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../../public")));

// In-memory cache of connected clients
const connectedClients = new Map<string, ClientStatus>();

/**
 * CLIENT ENDPOINT: Receive report from client
 */
app.post("/api/client/report", (req: Request, res: Response) => {
  try {
    const report: ClientReport = req.body;

    console.log(
      `📥 Report received from: ${report.computerName} (${report.userId})`,
    );
    console.log(`   Status: ${report.status}`);
    console.log(
      `   Threats: ${report.detections.filter((d) => d.isDetected).length}`,
    );

    // Update in-memory cache
    connectedClients.set(report.userId, {
      ...report,
      lastSeen: new Date(),
      isOnline: true,
    });

    // Save to database
    db.saveReport(report);

    // Alert if threat detected
    if (report.status === "threat") {
      console.log("🚨 THREAT ALERT!");
      console.log(`   Computer: ${report.computerName}`);
      console.log(`   User: ${report.userId}`);
      console.log(`   Severity: ${report.severity}`);
      console.log(
        `   Detections: ${report.detections
          .filter((d) => d.isDetected)
          .map((d) => d.detectorType)
          .join(", ")}`,
      );
    }

    res.json({ success: true, message: "Report received" });
  } catch (error) {
    console.error("❌ Error receiving report:", error);
    res.status(500).json({ error: "Failed to process report" });
  }
});

/**
 * ADMIN ENDPOINT: Get all connected clients
 */
app.get("/api/admin/clients", (req: Request, res: Response) => {
  const clients = Array.from(connectedClients.values()).map((client) => ({
    ...client,
    isOnline: isClientOnline(client.lastSeen),
  }));

  res.json({ clients });
});

/**
 * ADMIN ENDPOINT: Get specific client details with history
 */
app.get("/api/admin/clients/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const client = connectedClients.get(userId);

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  // Get historical data
  const history = db.getClientHistory(userId, 100);

  res.json({
    client: {
      ...client,
      isOnline: isClientOnline(client.lastSeen),
    },
    history,
  });
});

/**
 * ADMIN ENDPOINT: Get statistics
 */
app.get("/api/admin/stats", (req: Request, res: Response) => {
  const clients = Array.from(connectedClients.values());

  const stats = {
    totalClients: clients.length,
    onlineClients: clients.filter((c) => isClientOnline(c.lastSeen)).length,
    threatsDetected: clients.filter((c) => c.status === "threat").length,
    cleanSystems: clients.filter((c) => c.status === "clean").length,
  };

  res.json(stats);
});

/**
 * ADMIN ENDPOINT: Get all reports from database
 */
app.get("/api/admin/reports", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 1000;
  const reports = db.getAllReports(limit);
  res.json({ reports });
});

/**
 * Helper: Check if client is online (seen in last 30 seconds)
 */
function isClientOnline(lastSeen: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - new Date(lastSeen).getTime();
  return diff < 30000; // 30 seconds
}

/**
 * Start server
 */
const PORT = 8082;
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     CENTRAL MONITORING SERVER          ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin API available at:`);
  console.log(`   - GET  /api/admin/stats`);
  console.log(`   - GET  /api/admin/clients`);
  console.log(`   - GET  /api/admin/clients/:userId`);
  console.log(`   - GET  /api/admin/reports`);
  console.log(`📥 Client endpoint:`);
  console.log(`   - POST /api/client/report`);
  console.log("═══════════════════════════════════════════\n");
  console.log("Waiting for client connections...\n");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  db.close();
  process.exit(0);
});
