import chalk from "chalk";
import { ScanResult, DetectionResult } from "../types";
import { ALERT_CONFIG } from "../config/settings";

/**
 * ALERT SERVICE
 * Sends alerts when remote desktop access is detected
 * Can be extended to send emails, webhooks, SMS, etc.
 */
export class AlertService {
  /**
   * Send alert based on scan result
   */
  sendAlert(scanResult: ScanResult): void {
    if (!ALERT_CONFIG.enabled || !scanResult.hasRemoteAccess) {
      return;
    }

    // Console alert
    this.displayConsoleAlert(scanResult);

    // Additional alert methods can be added here
    // e.g., sendEmailAlert(), sendWebhookAlert(), sendSMSAlert()
  }

  /**
   * Display a prominent console alert
   */
  private displayConsoleAlert(scanResult: ScanResult): void {
    console.log("\n");
    console.log(chalk.bgRed.white.bold(" ".repeat(70)));
    console.log(
      chalk.bgRed.white.bold(
        "  ⚠️  REMOTE DESKTOP ACCESS DETECTED  ⚠️  ".padEnd(70),
      ),
    );
    console.log(chalk.bgRed.white.bold(" ".repeat(70)));
    console.log("");

    console.log(chalk.red.bold("Summary:"));
    console.log(chalk.red(`  ${scanResult.summary}`));
    console.log("");

    console.log(chalk.red.bold("Detections:"));
    scanResult.detections.forEach((detection, index) => {
      if (detection.isDetected) {
        console.log(
          chalk.red(
            `  ${index + 1}. [${detection.severity.toUpperCase()}] ${detection.details}`,
          ),
        );
      }
    });

    console.log("");
    console.log(chalk.bgRed.white.bold(" ".repeat(70)));
    console.log("\n");
  }

  /**
   * Send critical alert (for high/critical severity detections)
   */
  sendCriticalAlert(detection: DetectionResult): void {
    if (!ALERT_CONFIG.enabled) return;

    if (detection.severity === "critical" || detection.severity === "high") {
      console.log("\n");
      console.log(chalk.bgRed.white.bold(" CRITICAL ALERT "));
      console.log(chalk.red.bold(detection.details));
      console.log("");
    }
  }

  /**
   * Send custom notification
   */
  notifyUser(
    message: string,
    severity: "low" | "medium" | "high" | "critical" = "medium",
  ): void {
    const severityColors = {
      low: chalk.green,
      medium: chalk.yellow,
      high: chalk.red,
      critical: chalk.bgRed.white,
    };

    const color = severityColors[severity];
    console.log(color(`[ALERT] ${message}`));
  }

  /**
   * Placeholder for email alerts
   * You can implement this using nodemailer or similar
   */
  private async sendEmailAlert(scanResult: ScanResult): Promise<void> {
    // TODO: Implement email sending logic
    // Example: use nodemailer to send emails to ALERT_CONFIG.emailRecipients
  }

  /**
   * Placeholder for webhook alerts
   * You can implement this to send to Slack, Discord, etc.
   */
  private async sendWebhookAlert(scanResult: ScanResult): Promise<void> {
    // TODO: Implement webhook sending logic
    // Example: POST to ALERT_CONFIG.webhookUrl
  }
}
