import * as os from "os";

/**
 * CLIENT CONFIGURATION
 * Manages client settings for connecting to central server
 */

export interface ClientConfig {
  serverUrl: string;
  userId: string;
  reportInterval: number; // in milliseconds
  computerName: string;
  username: string;
}

/**
 * Load client configuration from environment variables or use defaults
 */
export function loadClientConfig(): ClientConfig {
  return {
    serverUrl: process.env.SERVER_URL || "http://localhost:4000",
    userId: process.env.USER_ID || generateUserId(),
    reportInterval: parseInt(process.env.REPORT_INTERVAL || "10000"), // 10 seconds
    computerName: os.hostname(),
    username: os.userInfo().username,
  };
}

/**
 * Generate a unique user ID based on hostname and timestamp
 */
function generateUserId(): string {
  const hostname = os.hostname();
  const timestamp = Date.now();
  return `${hostname}-${timestamp}`;
}

/**
 * Display current configuration
 */
export function displayConfig(config: ClientConfig): void {
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
