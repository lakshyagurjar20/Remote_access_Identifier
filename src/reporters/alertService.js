const chalk = require("chalk");
const { ALERT_CONFIG } = require("../config/settings");

class AlertService {
  sendAlert(scanResult) {
    if (!ALERT_CONFIG.enabled || !scanResult.hasRemoteAccess) return;
    this.displayConsoleAlert(scanResult);
  }

  displayConsoleAlert(scanResult) {
    const bar = " ".repeat(70);
    console.log("\n");
    console.log(chalk.bgRed.white.bold(bar));
    console.log(chalk.bgRed.white.bold("    REMOTE DESKTOP ACCESS DETECTED    ".padEnd(70)));
    console.log(chalk.bgRed.white.bold(bar));
    console.log("");
    console.log(chalk.red.bold("Summary:"));
    console.log(chalk.red(`  ${scanResult.summary}`));
    console.log("");
    console.log(chalk.red.bold("Detections:"));
    scanResult.detections.forEach((detection, index) => {
      if (detection.isDetected) {
        console.log(chalk.red(`  ${index + 1}. [${detection.severity.toUpperCase()}] ${detection.details}`));
      }
    });
    console.log("");
    console.log(chalk.bgRed.white.bold(bar));
    console.log("\n");
  }

  sendCriticalAlert(detection) {
    if (!ALERT_CONFIG.enabled) return;
    if (detection.severity === "critical" || detection.severity === "high") {
      console.log("\n");
      console.log(chalk.bgRed.white.bold(" CRITICAL ALERT "));
      console.log(chalk.red.bold(detection.details));
      console.log("");
    }
  }

  notifyUser(message, severity = "medium") {
    const colors = {
      low:      chalk.green,
      medium:   chalk.yellow,
      high:     chalk.red,
      critical: chalk.bgRed.white,
    };
    console.log(colors[severity](`[ALERT] ${message}`));
  }

  // TODO: implement email alerts via nodemailer
  async sendEmailAlert(_scanResult) {}

  // TODO: implement webhook alerts (Slack, Discord, etc.)
  async sendWebhookAlert(_scanResult) {}
}

module.exports = { AlertService };
