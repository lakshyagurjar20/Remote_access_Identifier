const https = require("https");
const http = require("http");
const { ContinuousMonitor } = require("../monitors/continuousMonitor");

class ClientAgent {
  constructor(config) {
    this.config = config;
    this.monitor = new ContinuousMonitor();
    this.reportInterval = null;
  }

  async start() {
    console.log(" Client Agent Started");
    console.log(`   Server: ${this.config.serverUrl}`);
    console.log(`   User ID: ${this.config.userId}`);
    console.log(`   Computer: ${this.config.computerName}`);
    console.log(`   Monitoring interval: ${this.config.reportInterval / 1000}s\n`);

    await this.performScan();

    this.reportInterval = setInterval(async () => {
      await this.performScan();
    }, this.config.reportInterval);
  }

  stop() {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
    console.log(" Client Agent Stopped");
  }

  async performScan() {
    try {
      const scanResult = await this.monitor.runScan();
      console.log(`[${new Date().toLocaleTimeString()}] Scan completed`);
      console.log(`   Status: ${scanResult.hasRemoteAccess ? "THREAT DETECTED" : "Clean"}`);
      console.log(`   Threats found: ${scanResult.detections.filter((r) => r.isDetected).length}`);
      await this.sendReportToServer(scanResult);
    } catch (error) {
      console.error(" Scan error:", error);
    }
  }

  async sendReportToServer(scanResult) {
    try {
      const report = {
        userId: this.config.userId,
        computerName: this.config.computerName,
        timestamp: new Date().toISOString(),
        status: scanResult.hasRemoteAccess ? "threat" : "clean",
        severity: this.calculateSeverity(scanResult),
        detections: scanResult.detections,
        systemInfo: {
          platform: process.platform,
          hostname: this.config.computerName,
          username: this.config.username,
        },
      };

      const response = await this.makeHttpRequest(report);
      console.log(response.success ? "    Report sent to server" : "     Failed to send report");
    } catch {
      console.log("     Server unreachable (will retry next scan)");
    }
  }

  calculateSeverity(scanResult) {
    const severities = scanResult.detections.filter((d) => d.isDetected).map((d) => d.severity);
    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    return "low";
  }

  makeHttpRequest(data) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.config.serverUrl}/api/client/report`);
      const protocol = url.protocol === "https:" ? https : http;
      const postData = JSON.stringify(data);

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = protocol.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try { resolve(JSON.parse(body)); }
          catch { resolve({ success: false }); }
        });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => { req.destroy(); reject(new Error("Request timeout")); });
      req.write(postData);
      req.end();
    });
  }
}

module.exports = { ClientAgent };
