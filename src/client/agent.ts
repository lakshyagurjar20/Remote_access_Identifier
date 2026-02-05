import { SessionMonitor } from "../monitors/sessionMonitor";
import { ScanResult } from "../types";

/**
 * CLIENT AGENT
 * Runs on user's PC and reports detection results to central server
 */
export class ClientAgent {
  private sessionMonitor: SessionMonitor;
  private serverUrl: string;
  private userId: string;
  private reportInterval: NodeJS.Timeout | null = null;

  constructor(serverUrl: string, userId: string) {
    this.serverUrl = serverUrl;
    this.userId = userId;
    this.sessionMonitor = new SessionMonitor();
  }

  /**
   * Start the client agent - begins monitoring and reporting
   */
  async start(): Promise<void> {
    console.log("🚀 Client Agent Started");
    console.log(`   Server: ${this.serverUrl}`);
    console.log(`   User ID: ${this.userId}`);
    console.log(`   Monitoring interval: 10 seconds\n`);

    // Run initial scan
    await this.performScan();

    // Schedule periodic scans every 10 seconds
    this.reportInterval = setInterval(async () => {
      await this.performScan();
    }, 10000);
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
      console.log(`   Status: ${scanResult.overallStatus}`);
      console.log(
        `   Threats found: ${scanResult.results.filter((r) => r.isDetected).length}`,
      );

      // TODO: Send report to server (next step)
    } catch (error) {
      console.error("❌ Scan error:", error);
    }
  }
}
