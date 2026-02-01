import { check as tcpPortCheck } from "tcp-port-used";
import { exec } from "child_process";
import { promisify } from "util";
import { DetectionResult } from "../types";
import { KNOWN_REMOTE_APPS } from "../config/settings";

const execAsync = promisify(exec);

/**
 * NETWORK DETECTOR
 * Checks if common remote desktop ports are listening/in use
 * This helps detect remote access even if process names are obfuscated
 */
export class NetworkDetector {
  /**
   * Main detection method - scans for active remote desktop ports
   */
  async detect(): Promise<DetectionResult> {
    try {
      // Collect all unique ports from known remote apps
      const portsToCheck = this.getPortsToCheck();

      // Check each port
      const activePorts: number[] = [];
      const detectedApps: string[] = [];

      for (const portInfo of portsToCheck) {
        const isInUse = await this.checkPort(portInfo.port);
        if (isInUse) {
          activePorts.push(portInfo.port);

          // Get process name using the port
          const processName = await this.getProcessByPort(portInfo.port);

          if (processName) {
            detectedApps.push(
              `${portInfo.appName} - Port ${portInfo.port} (Process: ${processName})`,
            );
          } else {
            detectedApps.push(
              `${portInfo.appName} - Port ${portInfo.port} (Process: Unknown)`,
            );
          }
        }
      }

      if (activePorts.length > 0) {
        return {
          isDetected: true,
          detectorType: "network",
          details: `Found ${activePorts.length} active remote desktop port(s): ${detectedApps.join(", ")}`,
          timestamp: new Date(),
          severity: this.calculateSeverity(activePorts),
          detectedItems: detectedApps,
        };
      }

      return {
        isDetected: false,
        detectorType: "network",
        details: "No remote desktop ports detected",
        timestamp: new Date(),
        severity: "low",
      };
    } catch (error) {
      return {
        isDetected: false,
        detectorType: "network",
        details: `Error during network detection: ${error}`,
        timestamp: new Date(),
        severity: "low",
      };
    }
  }

  /**
   * Extract all ports to check from known remote apps
   */
  private getPortsToCheck(): Array<{
    port: number;
    appName: string;
    severity: string;
  }> {
    const ports: Array<{ port: number; appName: string; severity: string }> =
      [];

    for (const app of KNOWN_REMOTE_APPS) {
      if (app.commonPorts) {
        for (const port of app.commonPorts) {
          ports.push({
            port,
            appName: app.name,
            severity: app.severity,
          });
        }
      }
    }

    return ports;
  }

  /**
   * Check if a specific port is in use
   */
  private async checkPort(port: number): Promise<boolean> {
    try {
      // Check if port is in use on localhost
      return await tcpPortCheck(port, "127.0.0.1");
    } catch (error) {
      // If there's an error checking, assume port is not in use
      return false;
    }
  }

  /**
   * Get the process name using a specific port (Windows)
   */
  private async getProcessByPort(port: number): Promise<string | null> {
    try {
      // Use netstat to find process using the port
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);

      if (!stdout) return null;

      // Extract PID from netstat output
      const lines = stdout.trim().split("\n");
      for (const line of lines) {
        // Look for LISTENING state
        if (line.includes("LISTENING") || line.includes("ESTABLISHED")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          if (pid && !isNaN(Number(pid))) {
            // Get process name from PID
            const processName = await this.getProcessNameByPID(pid);
            if (processName) {
              return processName;
            }
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get process name from PID (Windows)
   */
  private async getProcessNameByPID(pid: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(
        `tasklist /FI "PID eq ${pid}" /FO CSV /NH`,
      );

      if (!stdout) return null;

      // Parse CSV output to get process name
      const match = stdout.match(/"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate severity based on which ports are active
   */
  private calculateSeverity(
    activePorts: number[],
  ): "low" | "medium" | "high" | "critical" {
    // Port 3389 (RDP) is critical
    if (activePorts.includes(3389)) return "critical";

    // VNC ports (5900-5902) or TeamViewer ports are critical
    if (activePorts.some((p) => [5900, 5901, 5902, 5938, 5939].includes(p))) {
      return "critical";
    }

    // If 3+ ports are active, it's high severity
    if (activePorts.length >= 3) return "high";

    // 1-2 ports active
    if (activePorts.length > 0) return "medium";

    return "low";
  }

  /**
   * Quick check - returns true if any remote desktop port is in use
   */
  async isRemoteAccessActive(): Promise<boolean> {
    const result = await this.detect();
    return result.isDetected;
  }
}
