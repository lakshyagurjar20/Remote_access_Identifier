import { SessionMonitor } from "./sessionMonitor";
import { Logger } from "../reporters/logger";
import { MONITOR_CONFIG } from "../config/settings";
import { ScanResult } from "../types";

/**
 * CONTINUOUS MONITOR
 * Runs scans repeatedly at configured intervals
 * Perfect for background monitoring during exams/assessments
 */
export class ContinuousMonitor {
  private isMonitoring: boolean;
  private sessionMonitor: SessionMonitor;
  private logger: Logger;
  private intervalId: NodeJS.Timeout | null;
  private scanCount: number;

  constructor() {
    this.isMonitoring = false;
    this.sessionMonitor = new SessionMonitor();
    this.logger = new Logger();
    this.intervalId = null;
    this.scanCount = 0;
  }

  /**
   * Start continuous monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      this.logger.logWarning("Monitoring is already running");
      return;
    }

    this.isMonitoring = true;
    this.scanCount = 0;
    this.logger.logInfo(
      `Starting continuous monitoring (interval: ${MONITOR_CONFIG.checkInterval}ms)`,
    );

    // Run first scan immediately
    await this.performScan();

    // Schedule periodic scans
    this.intervalId = setInterval(async () => {
      await this.performScan();
    }, MONITOR_CONFIG.checkInterval);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      this.logger.logWarning("Monitoring is not currently running");
      return;
    }

    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.logger.logInfo(
      `Continuous monitoring stopped after ${this.scanCount} scans`,
    );
  }

  /**
   * Perform a single scan
   */
  private async performScan(): Promise<void> {
    this.scanCount++;
    this.logger.logInfo(`Running scan #${this.scanCount}...`);

    try {
      const result: ScanResult = await this.sessionMonitor.runScan();

      // Additional handling for continuous monitoring
      if (result.hasRemoteAccess) {
        this.logger.logWarning(
          "Remote access detected during continuous monitoring!",
        );
      }
    } catch (error) {
      this.logger.logError(`Error during scan #${this.scanCount}: ${error}`);
    }
  }

  /**
   * Check if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get scan statistics
   */
  getStats(): { isActive: boolean; scanCount: number; interval: number } {
    return {
      isActive: this.isMonitoring,
      scanCount: this.scanCount,
      interval: MONITOR_CONFIG.checkInterval,
    };
  }
}
