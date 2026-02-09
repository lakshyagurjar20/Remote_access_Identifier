/**
 * MONGODB CONFIGURATION
 * Connection settings and database configuration
 */

export interface MongoConfig {
  uri: string;
  database: string;
  collections: {
    reports: string;
  };
}

/**
 * MongoDB connection configuration
 * Can be overridden with environment variables
 */
export const mongoConfig: MongoConfig = {
  // MongoDB connection URI
  // Default: local MongoDB instance (using IPv4 address to avoid IPv6 issues)
  // Can be set via MONGO_URI environment variable
  uri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",

  // Database name
  // Can be set via MONGO_DB environment variable
  database: process.env.MONGO_DB || "remote_desktop_monitor",

  // Collection names
  collections: {
    reports: "scan_reports",
  },
};

/**
 * Display MongoDB configuration
 */
export function displayMongoConfig(): void {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     MONGODB CONFIGURATION              ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`  URI:        ${mongoConfig.uri}`);
  console.log(`  Database:   ${mongoConfig.database}`);
  console.log(`  Collection: ${mongoConfig.collections.reports}`);
  console.log("═══════════════════════════════════════════\n");
}
