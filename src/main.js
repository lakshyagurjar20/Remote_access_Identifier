const { ContinuousMonitor } = require("./monitors/continuousMonitor");
const { Logger } = require("./reporters/logger");

const logger = new Logger();
const continuousMonitor = new ContinuousMonitor();

function displayBanner() {
  console.log("\n" + "=".repeat(70));
  console.log("  Remote Desktop Access Identifier");
  console.log("  Detecting unauthorized remote access during tests/assessments");
  console.log("=".repeat(70) + "\n");
}

async function main() {
  displayBanner();
  logger.logInfo("Starting continuous monitoring mode...");
  logger.logInfo("Press Ctrl+C to stop monitoring");

  await continuousMonitor.startMonitoring();

  const shutdown = () => {
    console.log("\n");
    logger.logInfo("Shutting down...");
    continuousMonitor.stopMonitoring();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.logError(`Fatal error: ${error}`);
  process.exit(1);
});
