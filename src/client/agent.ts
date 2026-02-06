import { SessionMonitor } from "../monitors/sessionMonitor";
import { ScanResult } from "../types";
import { ClientConfig } from "./config";

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
   * Perform a scan and prepare report (will send to server in next step)
   */
  private async performScan(): Promise<void> {
    try {
      const scanResult: ScanResult = await this.sessionMonitor.runScan();

      // For now, just log the result (we'll add server reporting in next step)
      console.log(`[${new Date().toLocaleTimeString()}] Scan completed`);
      console.log(
        `   Status: ${scanResult.hasRemoteAccess ? "THREAT DETECTED" : "Clean"}`,
      );
      console.log(
        `   Threats found: ${scanResult.detections.filter((r) => r.isDetected).length}`,
      );

      // TODO: Send report to server (next step)
    } catch (error) {
      console.error("❌ Scan error:", error);
    }
  }
}
