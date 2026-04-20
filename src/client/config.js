const os = require("os");

function loadClientConfig() {
  return {
    serverUrl: process.env.SERVER_URL || "http://localhost:8082",
    userId: process.env.USER_ID || generateUserId(),
    reportInterval: parseInt(process.env.REPORT_INTERVAL || "10000"),
    computerName: os.hostname(),
    username: os.userInfo().username,
  };
}

function generateUserId() {
  return `${os.hostname()}-${Date.now()}`;
}

function displayConfig(config) {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     CLIENT CONFIGURATION               ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`  Server URL:      ${config.serverUrl}`);
  console.log(`  User ID:         ${config.userId}`);
  console.log(`  Computer Name:   ${config.computerName}`);
  console.log(`  Username:        ${config.username}`);
  console.log(`  Report Interval: ${config.reportInterval / 1000}s`);
  console.log("═══════════════════════════════════════════\n");
}

module.exports = { loadClientConfig, displayConfig };
