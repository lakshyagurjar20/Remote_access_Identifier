import psList from "ps-list";
import { DetectionResult, ProcessInfo } from "../types";
import { KNOWN_REMOTE_APPS } from "../config/settings";

/**
 * PROCESS DETECTOR
 * Scans all running processes on the system and compares them against
 * known remote desktop application process names
 */
export class ProcessDetector {
  /**
   * Main detection method - scans for remote desktop processes
   */
  async detect(): Promise<DetectionResult> {
    try {
      // Get list of all running processes
      const processes = await this.getRunningProcesses();

      // Check each process against our known remote apps
      const detectedApps: string[] = [];
      const detectedProcesses: ProcessInfo[] = [];

      for (const process of processes) {
        for (const app of KNOWN_REMOTE_APPS) {
          // Check if process name matches any known remote desktop app
          const isMatch = app.processNames.some(
            (appProcess) =>
              process.name.toLowerCase() === appProcess.toLowerCase(),
          );

          if (isMatch) {
            detectedApps.push(app.name);
            detectedProcesses.push(process);
          }
        }
      }

      // Remove duplicates
      const uniqueApps = [...new Set(detectedApps)];

      if (uniqueApps.length > 0) {
        return {
          isDetected: true,
          detectorType: "process",
          details: `Found ${uniqueApps.length} remote desktop application(s) running: ${uniqueApps.join(", ")}`,
          timestamp: new Date(),
          severity: this.calculateSeverity(uniqueApps),
          detectedItems: uniqueApps,
        };
      }

      return {
        isDetected: false,
        detectorType: "process",
        details: "No remote desktop processes detected",
        timestamp: new Date(),
        severity: "low",
      };
    } catch (error) {
      return {
        isDetected: false,
        detectorType: "process",
        details: `Error during process detection: ${error}`,
        timestamp: new Date(),
        severity: "low",
      };
    }
  }

  /**
   * Get all running processes on the system
   */
  private async getRunningProcesses(): Promise<ProcessInfo[]> {
    try {
      const tasks = await psList();
      return tasks.map((task: any) => ({
        name: task.name,
        pid: task.pid,
        path: task.cmd || "",
      }));
    } catch (error) {
      console.error("Failed to get process list:", error);
      return [];
    }
  }

  /**
   * Calculate severity based on detected apps
   */
  private calculateSeverity(
    detectedApps: string[],
  ): "low" | "medium" | "high" | "critical" {
    const severities = detectedApps.map((appName) => {
      const app = KNOWN_REMOTE_APPS.find((a) => a.name === appName);
      return app?.severity || "low";
    });

    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    return "low";
  }

  /**
   * Quick check - returns true if any remote desktop process is running
   */
  async isRemoteDesktopActive(): Promise<boolean> {
    const result = await this.detect();
    return result.isDetected;
  }
}
