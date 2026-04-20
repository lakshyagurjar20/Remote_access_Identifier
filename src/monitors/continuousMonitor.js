const { SessionMonitor } = require("./sessionMonitor");
const { Logger } = require("../reporters/logger");
const { MONITOR_CONFIG } = require("../config/settings");

class ContinuousMonitor {
  constructor() {
    this.isMonitoring = false;
    this.sessionMonitor = new SessionMonitor();
    this.logger = new Logger();
    this.intervalId = null;
    this.scanCount = 0;
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.logWarning("Monitoring is already running");
      return;
    }

    this.isMonitoring = true;
    this.scanCount = 0;
    this.logger.logInfo(`Starting continuous monitoring (interval: ${MONITOR_CONFIG.checkInterval}ms)`);

    await this.performScan();

    this.intervalId = setInterval(async () => {
      await this.performScan();
    }, MONITOR_CONFIG.checkInterval);
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      this.logger.logWarning("Monitoring is not currently running");
      return;
    }

    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.logger.logInfo(`Continuous monitoring stopped after ${this.scanCount} scans`);
  }

  async performScan() {
    this.scanCount++;
    this.logger.logInfo(`Running scan #${this.scanCount}...`);

    try {
      const result = await this.sessionMonitor.runScan();
      if (result.hasRemoteAccess) {
        this.logger.logWarning("Remote access detected during continuous monitoring!");
      }
    } catch (error) {
      this.logger.logError(`Error during scan #${this.scanCount}: ${error}`);
    }
  }

  isActive() {
    return this.isMonitoring;
  }

  getStats() {
    return {
      isActive: this.isMonitoring,
      scanCount: this.scanCount,
      interval: MONITOR_CONFIG.checkInterval,
    };
  }
}

module.exports = { ContinuousMonitor };
