const { ProcessDetector } = require("../detectors/processDetector");
const { NetworkDetector } = require("../detectors/networkDetector");
const { RegistryDetector } = require("../detectors/registryDetector");
const { Logger } = require("../reporters/logger");
const { AlertService } = require("../reporters/alertService");
const { MONITOR_CONFIG } = require("../config/settings");

class ContinuousMonitor {
  constructor() {
    this.isMonitoring = false;
    this.processDetector = new ProcessDetector();
    this.networkDetector = new NetworkDetector();
    this.registryDetector = new RegistryDetector();
    this.logger = new Logger();
    this.alertService = new AlertService();
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

  async runScan() {
    this.logger.logInfo("Running remote desktop detection scan...");
    const detections = [];

    try {
      const [processResult, networkResult, registryResult] = await Promise.all([
        this.processDetector.detect(),
        this.networkDetector.detect(),
        this.registryDetector.detect(),
      ]);

      detections.push(processResult, networkResult, registryResult);
      detections.forEach((detection) => this.logger.logDetection(detection));
    } catch (error) {
      this.logger.logError(`Error during scan: ${error}`);
    }

    const scanResult = this.compileScanResult(detections);
    this.logger.logScanResult(scanResult);

    if (scanResult.hasRemoteAccess) {
      this.alertService.sendAlert(scanResult);
    }

    return scanResult;
  }

  compileScanResult(detections) {
    const hasRemoteAccess = detections.some((d) => d.isDetected);
    const detectedItems = [];

    detections.forEach((detection) => {
      if (detection.isDetected && detection.detectedItems) {
        detectedItems.push(...detection.detectedItems);
      }
    });

    return {
      hasRemoteAccess,
      detections,
      scanTime: new Date(),
      summary: hasRemoteAccess
        ? `Remote desktop access DETECTED! Found ${detectedItems.length} indicator(s).`
        : "No remote desktop access detected. System is clean.",
    };
  }

  async performScan() {
    this.scanCount++;
    this.logger.logInfo(`Running scan #${this.scanCount}...`);

    try {
      const result = await this.runScan();
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
