const express = require("express");
const cors = require("cors");
const path = require("path");
const { MonitoringDatabase } = require("./database");
const { displayMongoConfig } = require("../config/mongoConfig");

const app = express();
const db = new MonitoringDatabase();
const connectedClients = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

app.post("/api/client/report", async (req, res) => {
  try {
    const report = req.body;

    console.log(` Report received from: ${report.computerName} (${report.userId})`);
    console.log(`   Status: ${report.status}`);
    console.log(`   Threats: ${report.detections.filter((d) => d.isDetected).length}`);

    connectedClients.set(report.userId, {
      ...report,
      lastSeen: new Date(),
      isOnline: true,
    });

    if (report.status === "threat") {
      await db.saveReport(report);
      console.log(" THREAT ALERT!");
      console.log(`   Computer: ${report.computerName}`);
      console.log(`   User: ${report.userId}`);
      console.log(`   Severity: ${report.severity}`);
      console.log(`   Detections: ${report.detections.filter((d) => d.isDetected).map((d) => d.detectorType).join(", ")}`);
    } else {
      console.log(" Clean scan - not saved to database");
    }

    res.json({ success: true, message: "Report received" });
  } catch (error) {
    console.error(" Error receiving report:", error);
    res.status(500).json({ error: "Failed to process report" });
  }
});

app.get("/api/admin/clients", (req, res) => {
  const clients = Array.from(connectedClients.values()).map((client) => ({
    ...client,
    isOnline: isClientOnline(client.lastSeen),
  }));
  res.json({ clients });
});

app.get("/api/admin/clients/:userId", async (req, res) => {
  const { userId } = req.params;
  const client = connectedClients.get(userId);

  if (!client) {
    return res.status(404).json({ error: "Client not found" });
  }

  const history = await db.getClientHistory(userId, 100);
  res.json({
    client: { ...client, isOnline: isClientOnline(client.lastSeen) },
    history,
  });
});

app.get("/api/admin/stats", (req, res) => {
  const clients = Array.from(connectedClients.values());
  res.json({
    totalClients: clients.length,
    onlineClients: clients.filter((c) => isClientOnline(c.lastSeen)).length,
    threatsDetected: clients.filter((c) => c.status === "threat").length,
    cleanSystems: clients.filter((c) => c.status === "clean").length,
  });
});

app.get("/api/admin/reports", async (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  const reports = await db.getAllReports(limit);
  res.json({ reports });
});

// A client is considered "online" if it has reported within the last 30 seconds
function isClientOnline(lastSeen) {
  return new Date().getTime() - new Date(lastSeen).getTime() < 30000;
}

const PORT = 8082;

async function startServer() {
  try {
    displayMongoConfig();
    await db.connect();

    app.listen(PORT, () => {
      console.log("╔════════════════════════════════════════╗");
      console.log("║     CENTRAL MONITORING SERVER          ║");
      console.log("╚════════════════════════════════════════╝");
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Admin API: /api/admin/stats | /api/admin/clients | /api/admin/reports`);
      console.log(` Client endpoint: POST /api/client/report`);
      console.log(`\n Admin Dashboard: http://localhost:${PORT}/admin/dashboard.html\n`);
      console.log("Waiting for client connections...\n");
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  console.log("\n Shutting down server...");
  await db.close();
  process.exit(0);
});
