const { ProcessDetector } = require("../detectors/processDetector");
const { NetworkDetector } = require("../detectors/networkDetector");
const { RegistryDetector } = require("../detectors/registryDetector");
const { Logger } = require("../reporters/logger");
const { AlertService } = require("../reporters/alertService");

class SessionMonitor {
  constructor() {
    this.processDetector = new ProcessDetector();
    this.networkDetector = new NetworkDetector();
    this.registryDetector = new RegistryDetector();
    this.logger = new Logger();
    this.alertService = new AlertService();
  }

  async runScan() {
    this.logger.logInfo("Starting remote desktop detection scan...");
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

  async isRemoteAccessDetected() {
    const result = await this.runScan();
    return result.hasRemoteAccess;
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
}

module.exports = { SessionMonitor };
