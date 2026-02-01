import { ProcessDetector } from "../detectors/processDetector";
import { NetworkDetector } from "../detectors/networkDetector";
import { RegistryDetector } from "../detectors/registryDetector";
import { Logger } from "../reporters/logger";
import { AlertService } from "../reporters/alertService";
import { ScanResult, DetectionResult } from "../types";

/**
 * SESSION MONITOR
 * Performs a single comprehensive scan using all detection methods
 * Perfect for one-time checks or scheduled scans
 */
export class SessionMonitor {
  private processDetector: ProcessDetector;
  private networkDetector: NetworkDetector;
  private registryDetector: RegistryDetector;
  private logger: Logger;
  private alertService: AlertService;

  constructor() {
    this.processDetector = new ProcessDetector();
    this.networkDetector = new NetworkDetector();
    this.registryDetector = new RegistryDetector();
    this.logger = new Logger();
    this.alertService = new AlertService();
  }

  /**
   * Run a complete scan using all detectors
   */
  async runScan(): Promise<ScanResult> {
    this.logger.logInfo("Starting remote desktop detection scan...");

    const detections: DetectionResult[] = [];

    try {
      // Run all detectors in parallel for faster results
      const [processResult, networkResult, registryResult] = await Promise.all([
        this.processDetector.detect(),
        this.networkDetector.detect(),
        this.registryDetector.detect(),
      ]);

      detections.push(processResult, networkResult, registryResult);

      // Log each detection
      detections.forEach((detection) => {
        this.logger.logDetection(detection);
      });
    } catch (error) {
      this.logger.logError(`Error during scan: ${error}`);
    }

    // Compile results
    const scanResult = this.compileScanResult(detections);

    // Log summary
    this.logger.logScanResult(scanResult);

    // Send alerts if remote access detected
    if (scanResult.hasRemoteAccess) {
      this.alertService.sendAlert(scanResult);
    }

    return scanResult;
  }

  /**
   * Quick check - just returns true/false if remote access detected
   */
  async isRemoteAccessDetected(): Promise<boolean> {
    const result = await this.runScan();
    return result.hasRemoteAccess;
  }

  /**
   * Compile all detection results into a scan result
   */
  private compileScanResult(detections: DetectionResult[]): ScanResult {
    const hasRemoteAccess = detections.some((d) => d.isDetected);
    const detectedItems: string[] = [];

    detections.forEach((detection) => {
      if (detection.isDetected && detection.detectedItems) {
        detectedItems.push(...detection.detectedItems);
      }
    });

    const summary = hasRemoteAccess
      ? `Remote desktop access DETECTED! Found ${detectedItems.length} indicator(s).`
      : "No remote desktop access detected. System is clean.";

    return {
      hasRemoteAccess,
      detections,
      scanTime: new Date(),
      summary,
    };
  }
}
