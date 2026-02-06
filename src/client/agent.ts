import { SessionMonitor } from "../monitors/sessionMonitor";
import { ScanResult } from "../types";
import { ClientConfig } from "./config";
import * as https from "https";
import * as http from "http";

/**
 * CLIENT AGENT
 * Runs on user's PC and reports detection results to central server
 */
export class ClientAgent {
  private sessionMonitor: SessionMonitor;
  private config: ClientConfig;
  private reportInterval: NodeJS.Timeout | null = null;

  constructor(config: ClientConfig) {
    this.config = config;
    this.sessionMonitor = new SessionMonitor();
  }

  /**
   * Start the client agent - begins monitoring and reporting
   */
  async start(): Promise<void> {
    console.log("🚀 Client Agent Started");
    console.log(`   Server: ${this.config.serverUrl}`);
    console.log(`   User ID: ${this.config.userId}`);
    console.log(`   Computer: ${this.config.computerName}`);
    console.log(
      `   Monitoring interval: ${this.config.reportInterval / 1000}s\n`,
    );

    // Run initial scan
    await this.performScan();

    // Schedule periodic scans
    this.reportInterval = setInterval(async () => {
      await this.performScan();
    }, this.config.reportInterval);
  }

  /**
   * Stop the client agent
   */
  stop(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
    console.log("🛑 Client Agent Stopped");
  }

  /**
   * Perform a scan and send report to server
   */
  private async performScan(): Promise<void> {
    try {
      const scanResult: ScanResult = await this.sessionMonitor.runScan();

      // Log the result
      console.log(`[${new Date().toLocaleTimeString()}] Scan completed`);
      console.log(
        `   Status: ${scanResult.hasRemoteAccess ? "THREAT DETECTED" : "Clean"}`,
      );
      console.log(
        `   Threats found: ${scanResult.detections.filter((r) => r.isDetected).length}`,
      );

      // Send report to server
      await this.sendReportToServer(scanResult);
    } catch (error) {
      console.error("❌ Scan error:", error);
    }
  }

  /**
   * Send scan report to central server
   */
  private async sendReportToServer(scanResult: ScanResult): Promise<void> {
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

      if (response.success) {
        console.log("   ✅ Report sent to server");
      } else {
        console.log("   ⚠️  Failed to send report");
      }
    } catch (error) {
      console.log("   ⚠️  Server unreachable (will retry next scan)");
    }
  }

  /**
   * Calculate overall severity from scan results
   */
  private calculateSeverity(scanResult: ScanResult): string {
    const severities = scanResult.detections
      .filter((d) => d.isDetected)
      .map((d) => d.severity);

    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    return "low";
  }

  /**
   * Make HTTP POST request to server
   */
  private async makeHttpRequest(data: any): Promise<any> {
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

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ success: false });
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.write(postData);
      req.end();
    });
  }
}
