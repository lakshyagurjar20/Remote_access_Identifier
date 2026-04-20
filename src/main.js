const chalk = require("chalk");
const { ContinuousMonitor } = require("./monitors/continuousMonitor");
const { SessionMonitor } = require("./monitors/sessionMonitor");
const { Logger } = require("./reporters/logger");

const logger = new Logger();
const sessionMonitor = new SessionMonitor();
const continuousMonitor = new ContinuousMonitor();

function displayBanner() {
  console.log(chalk.cyan.bold("\n" + "=".repeat(70)));
  console.log(chalk.cyan.bold("  Remote Desktop Access Identifier"));
  console.log(chalk.cyan.bold("  Detecting unauthorized remote access during tests/assessments"));
  console.log(chalk.cyan.bold("=".repeat(70) + "\n"));
}

function displayUsage() {
  console.log(chalk.yellow("Usage:"));
  console.log("  npm start                 - Run a single scan");
  console.log("  npm start -- --continuous - Run continuous monitoring");
  console.log("  npm start -- --help       - Display this help message");
  console.log("");
}

async function runSingleScan() {
  logger.logInfo("Running single scan...");
  const result = await sessionMonitor.runScan();

  if (result.hasRemoteAccess) {
    logger.logWarning("  Remote desktop access detected on this system!");
    process.exit(1);
  } else {
    logger.logInfo(" No remote desktop access detected. System is clean.");
    process.exit(0);
  }
}

async function runContinuousMonitoring() {
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

async function main() {
  displayBanner();
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    displayUsage();
    return;
  }

  if (args.includes("--continuous") || args.includes("-c")) {
    await runContinuousMonitoring();
  } else {
    await runSingleScan();
  }
}

main().catch((error) => {
  logger.logError(`Fatal error: ${error}`);
  process.exit(1);
});
