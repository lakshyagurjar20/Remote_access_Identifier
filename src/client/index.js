const { ClientAgent } = require("./agent");
const { loadClientConfig, displayConfig } = require("./config");

async function main() {
  try {
    const config = loadClientConfig();
    displayConfig(config);

    const agent = new ClientAgent(config);
    console.log("Starting continuous monitoring...\n");
    await agent.start();

    const shutdown = () => {
      console.log("\n\n Shutdown signal received...");
      agent.stop();
      console.log(" Client agent stopped successfully");
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    console.log("Press Ctrl+C to stop monitoring\n");
  } catch (error) {
    console.error(" Fatal error:", error);
    process.exit(1);
  }
}

main();
