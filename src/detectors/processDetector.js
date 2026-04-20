const psList = require("ps-list");
const { KNOWN_REMOTE_APPS } = require("../config/settings");

class ProcessDetector {
  async detect() {
    try {
      const processes = await this.getRunningProcesses();
      const detectedApps = [];

      for (const process of processes) {
        for (const app of KNOWN_REMOTE_APPS) {
          const isMatch = app.processNames.some(
            (appProcess) => process.name.toLowerCase() === appProcess.toLowerCase()
          );
          if (isMatch) detectedApps.push(app.name);
        }
      }

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

  async getRunningProcesses() {
    try {
      const tasks = await psList();
      return tasks.map((task) => ({
        name: task.name,
        pid: task.pid,
        path: task.cmd || "",
      }));
    } catch (error) {
      console.error("Failed to get process list:", error);
      return [];
    }
  }

  calculateSeverity(detectedApps) {
    const severities = detectedApps.map((appName) => {
      const app = KNOWN_REMOTE_APPS.find((a) => a.name === appName);
      return app?.severity || "low";
    });

    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    return "low";
  }

  async isRemoteDesktopActive() {
    const result = await this.detect();
    return result.isDetected;
  }
}

module.exports = { ProcessDetector };
