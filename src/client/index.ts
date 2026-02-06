import { ClientAgent } from "./agent";
import { loadClientConfig, displayConfig } from "./config";

/**
 * CLIENT APPLICATION ENTRY POINT
 * Starts the remote access detection client that reports to central server
 */

async function main() {
  try {
    // Load configuration
    const config = loadClientConfig();

    // Display configuration
    displayConfig(config);

    // Create and start client agent
    const agent = new ClientAgent(config);

    console.log("Starting continuous monitoring...\n");
    await agent.start();

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n\n🛑 Shutdown signal received...");
      agent.stop();
      console.log("✅ Client agent stopped successfully");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n\n🛑 Termination signal received...");
      agent.stop();
      console.log("✅ Client agent stopped successfully");
      process.exit(0);
    });

    // Keep the process running
    console.log("Press Ctrl+C to stop monitoring\n");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the client
main();
