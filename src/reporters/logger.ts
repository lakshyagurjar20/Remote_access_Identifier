import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { DetectionResult, ScanResult } from "../types";
import { MONITOR_CONFIG } from "../config/settings";

/**
 * LOGGER
 * Handles logging to both console and file
 * Uses colors for better readability in console
 */
export class Logger {
  private logFilePath: string;

  constructor() {
    this.logFilePath = MONITOR_CONFIG.logFilePath || "./logs/detection.log";
    this.ensureLogDirectoryExists();
  }

  /**
   * Log info message
   */
  logInfo(message: string): void {
    const formattedMessage = `[INFO] ${this.getTimestamp()} - ${message}`;
    console.log(chalk.blue(formattedMessage));
    this.writeToFile(formattedMessage);
  }

  /**
   * Log warning message
   */
  logWarning(message: string): void {
    const formattedMessage = `[WARNING] ${this.getTimestamp()} - ${message}`;
    console.warn(chalk.yellow(formattedMessage));
    this.writeToFile(formattedMessage);
  }

  /**
   * Log error message
   */
  logError(message: string): void {
    const formattedMessage = `[ERROR] ${this.getTimestamp()} - ${message}`;
    console.error(chalk.red(formattedMessage));
    this.writeToFile(formattedMessage);
  }

  /**
   * Log a detection result with appropriate formatting
   */
  logDetection(result: DetectionResult): void {
    const severityColor = this.getSeverityColor(result.severity);
    const message = `[DETECTION] ${result.detectorType.toUpperCase()} - ${result.details}`;

    console.log(severityColor(message));
    this.writeToFile(`${this.getTimestamp()} - ${message}`);
  }

  /**
   * Log a scan result summary
   */
  logScanResult(scanResult: ScanResult): void {
    const header = "\n" + "=".repeat(60);
    const footer = "=".repeat(60) + "\n";

    console.log(chalk.bold.cyan(header));
    console.log(
      chalk.bold(`SCAN SUMMARY - ${scanResult.scanTime.toLocaleString()}`),
    );
    console.log(
      chalk.bold(
        `Status: ${scanResult.hasRemoteAccess ? "DETECTED" : "CLEAN"}`,
      ),
    );
    console.log(`Summary: ${scanResult.summary}`);

    if (scanResult.detections.length > 0) {
      console.log("\nDetailed Results:");
      scanResult.detections.forEach((detection, index) => {
        const color = this.getSeverityColor(detection.severity);
        console.log(
          color(
            `  ${index + 1}. [${detection.detectorType}] ${detection.details}`,
          ),
        );
      });
    }

    console.log(chalk.bold.cyan(footer));

    // Write to file
    this.writeToFile(header);
    this.writeToFile(`SCAN SUMMARY - ${scanResult.scanTime.toLocaleString()}`);
    this.writeToFile(
      `Status: ${scanResult.hasRemoteAccess ? "DETECTED" : "CLEAN"}`,
    );
    this.writeToFile(`Summary: ${scanResult.summary}`);
    this.writeToFile(footer);
  }

  /**
   * Get color based on severity
   */
  private getSeverityColor(severity: string): any {
    switch (severity) {
      case "critical":
        return chalk.bold.red;
      case "high":
        return chalk.red;
      case "medium":
        return chalk.yellow;
      case "low":
        return chalk.green;
      default:
        return chalk.white;
    }
  }

  /**
   * Get current timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Write message to log file
   */
  private writeToFile(message: string): void {
    if (!MONITOR_CONFIG.logToFile) return;

    try {
      fs.appendFileSync(this.logFilePath, message + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectoryExists(): void {
    try {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
    }
  }
}
