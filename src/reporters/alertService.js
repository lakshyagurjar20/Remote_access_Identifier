const { ALERT_CONFIG } = require("../config/settings");

class AlertService {
  sendAlert(scanResult) {
    if (!ALERT_CONFIG.enabled || !scanResult.hasRemoteAccess) return;
    this.displayConsoleAlert(scanResult);
  }

  displayConsoleAlert(scanResult) {
    const bar = "=".repeat(70);
    console.log("\n");
    console.log(bar);
    console.log("    REMOTE DESKTOP ACCESS DETECTED    ");
    console.log(bar);
    console.log("");
    console.log("Summary:");
    console.log(`  ${scanResult.summary}`);
    console.log("");
    console.log("Detections:");
    scanResult.detections.forEach((detection, index) => {
      if (detection.isDetected) {
        console.log(`  ${index + 1}. [${detection.severity.toUpperCase()}] ${detection.details}`);
      }
    });
    console.log("");
    console.log(bar);
    console.log("\n");
  }

  sendCriticalAlert(detection) {
    if (!ALERT_CONFIG.enabled) return;
    if (detection.severity === "critical" || detection.severity === "high") {
      console.log("\n");
      console.log(" CRITICAL ALERT ");
      console.log(detection.details);
      console.log("");
    }
  }

  notifyUser(message, severity = "medium") {
    console.log(`[ALERT] ${message}`);
  }

  // TODO: implement email alerts via nodemailer
  async sendEmailAlert(_scanResult) {}

  // TODO: implement webhook alerts (Slack, Discord, etc.)
  async sendWebhookAlert(_scanResult) {}
}

module.exports = { AlertService };
