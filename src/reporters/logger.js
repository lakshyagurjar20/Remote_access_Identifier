const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { MONITOR_CONFIG } = require("../config/settings");

class Logger {
  constructor() {
    this.logFilePath = MONITOR_CONFIG.logFilePath || "./logs/detection.log";
    this.ensureLogDirectoryExists();
  }

  logInfo(message) {
    const formatted = `[INFO] ${this.getTimestamp()} - ${message}`;
    console.log(chalk.blue(formatted));
    this.writeToFile(formatted);
  }

  logWarning(message) {
    const formatted = `[WARNING] ${this.getTimestamp()} - ${message}`;
    console.warn(chalk.yellow(formatted));
    this.writeToFile(formatted);
  }

  logError(message) {
    const formatted = `[ERROR] ${this.getTimestamp()} - ${message}`;
    console.error(chalk.red(formatted));
    this.writeToFile(formatted);
  }

  logDetection(result) {
    const color = this.getSeverityColor(result.severity);
    const message = `[DETECTION] ${result.detectorType.toUpperCase()} - ${result.details}`;
    console.log(color(message));
    this.writeToFile(`${this.getTimestamp()} - ${message}`);
  }

  logScanResult(scanResult) {
    const separator = "=".repeat(60);
    console.log(chalk.bold.cyan(`\n${separator}`));
    console.log(chalk.bold(`SCAN SUMMARY - ${scanResult.scanTime.toLocaleString()}`));
    console.log(chalk.bold(`Status: ${scanResult.hasRemoteAccess ? "DETECTED" : "CLEAN"}`));
    console.log(`Summary: ${scanResult.summary}`);

    if (scanResult.detections.length > 0) {
      console.log("\nDetailed Results:");
      scanResult.detections.forEach((detection, index) => {
        const color = this.getSeverityColor(detection.severity);
        console.log(color(`  ${index + 1}. [${detection.detectorType}] ${detection.details}`));
      });
    }

    console.log(chalk.bold.cyan(`${separator}\n`));
    this.writeToFile(`\n${separator}`);
    this.writeToFile(`SCAN SUMMARY - ${scanResult.scanTime.toLocaleString()}`);
    this.writeToFile(`Status: ${scanResult.hasRemoteAccess ? "DETECTED" : "CLEAN"}`);
    this.writeToFile(`Summary: ${scanResult.summary}`);
    this.writeToFile(`${separator}\n`);
  }

  getSeverityColor(severity) {
    switch (severity) {
      case "critical": return chalk.bold.red;
      case "high":     return chalk.red;
      case "medium":   return chalk.yellow;
      case "low":      return chalk.green;
      default:         return chalk.white;
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  writeToFile(message) {
    if (!MONITOR_CONFIG.logToFile) return;
    try {
      fs.appendFileSync(this.logFilePath, message + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  ensureLogDirectoryExists() {
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

module.exports = { Logger };
