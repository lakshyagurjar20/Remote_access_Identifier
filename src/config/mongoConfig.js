const mongoConfig = {
  uri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
  database: process.env.MONGO_DB || "remote_desktop_monitor",
  collections: {
    reports: "scan_reports",
  },
};

function displayMongoConfig() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     MONGODB CONFIGURATION              ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`  URI:        ${mongoConfig.uri}`);
  console.log(`  Database:   ${mongoConfig.database}`);
  console.log(`  Collection: ${mongoConfig.collections.reports}`);
  console.log("═══════════════════════════════════════════\n");
}

module.exports = { mongoConfig, displayMongoConfig };
