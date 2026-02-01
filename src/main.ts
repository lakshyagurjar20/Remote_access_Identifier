import chalk from "chalk";
import { ContinuousMonitor } from "./monitors/continuousMonitor";
import { SessionMonitor } from "./monitors/sessionMonitor";
import { Logger } from "./reporters/logger";

/**
 * MAIN ENTRY POINT
 * Remote Desktop Access Identifier
 *
 * This application detects remote desktop applications running on a system
 * using three methods:
 * 1. Process Detection - Scans running processes
 * 2. Network Detection - Checks for active remote desktop ports
 * 3. Registry Detection - Looks for installed remote desktop software
 *
 * Usage:
 *   npm start              - Run a single scan
 *   npm start -- --continuous  - Run continuous monitoring
 */

const logger = new Logger();
const sessionMonitor = new SessionMonitor();
const continuousMonitor = new ContinuousMonitor();

/**
 * Display banner
 */
function displayBanner(): void {
  console.log(chalk.cyan.bold("\\n" + "=".repeat(70)));
  console.log(chalk.cyan.bold("  Remote Desktop Access Identifier"));
  console.log(
    chalk.cyan.bold(
      "  Detecting unauthorized remote access during tests/assessments",
    ),
  );
  console.log(chalk.cyan.bold("=".repeat(70) + "\\n"));
}

/**
 * Display usage instructions
 */
function displayUsage(): void {
  console.log(chalk.yellow("Usage:"));
  console.log("  npm start                 - Run a single scan");
  console.log("  npm start -- --continuous - Run continuous monitoring");
  console.log("  npm start -- --help       - Display this help message");
  console.log("");
}

/**
 * Run a single scan
 */
async function runSingleScan(): Promise<void> {
  logger.logInfo("Running single scan...");

  const result = await sessionMonitor.runScan();

  if (result.hasRemoteAccess) {
    logger.logWarning("⚠️  Remote desktop access detected on this system!");
    process.exit(1); // Exit with error code
  } else {
    logger.logInfo("✓ No remote desktop access detected. System is clean.");
    process.exit(0); // Exit successfully
  }
}

/**
 * Run continuous monitoring
 */
async function runContinuousMonitoring(): Promise<void> {
  logger.logInfo("Starting continuous monitoring mode...");
  logger.logInfo("Press Ctrl+C to stop monitoring");

  await continuousMonitor.startMonitoring();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\\n");
    logger.logInfo("Shutting down...");
    continuousMonitor.stopMonitoring();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\\n");
    logger.logInfo("Shutting down...");
    continuousMonitor.stopMonitoring();
    process.exit(0);
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  displayBanner();

  // Parse command line arguments
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

// Run the application
main().catch((error) => {
  logger.logError(`Fatal error: ${error}`);
  process.exit(1);
});
