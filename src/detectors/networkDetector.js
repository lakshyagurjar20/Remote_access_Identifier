const { check: tcpPortCheck } = require("tcp-port-used");
const { exec } = require("child_process");
const { promisify } = require("util");
const { KNOWN_REMOTE_APPS } = require("../config/settings");

const execAsync = promisify(exec);

class NetworkDetector {
  async detect() {
    try {
      const portsToCheck = this.getPortsToCheck();
      const activePorts = [];
      const detectedApps = [];

      for (const portInfo of portsToCheck) {
        const isInUse = await this.checkPort(portInfo.port);
        if (isInUse) {
          activePorts.push(portInfo.port);
          const processName = await this.getProcessByPort(portInfo.port);
          detectedApps.push(
            `${portInfo.appName} - Port ${portInfo.port} (Process: ${processName ?? "Unknown"})`
          );
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

  getPortsToCheck() {
    const ports = [];
    for (const app of KNOWN_REMOTE_APPS) {
      if (app.commonPorts) {
        for (const port of app.commonPorts) {
          ports.push({ port, appName: app.name, severity: app.severity });
        }
      }
    }
    return ports;
  }

  async checkPort(port) {
    try {
      return await tcpPortCheck(port, "127.0.0.1");
    } catch {
      return false;
    }
  }

  async getProcessByPort(port) {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      if (!stdout) return null;

      for (const line of stdout.trim().split("\n")) {
        if (line.includes("LISTENING") || line.includes("ESTABLISHED")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(Number(pid))) {
            return await this.getProcessNameByPID(pid);
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async getProcessNameByPID(pid) {
    try {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
      if (!stdout) return null;
      const match = stdout.match(/"([^"]+)"/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }

  calculateSeverity(activePorts) {
    if (activePorts.includes(3389)) return "critical";
    if (activePorts.some((p) => [5900, 5901, 5902, 5938, 5939].includes(p))) return "critical";
    if (activePorts.length >= 3) return "high";
    if (activePorts.length > 0) return "medium";
    return "low";
  }

  async isRemoteAccessActive() {
    const result = await this.detect();
    return result.isDetected;
  }
}

module.exports = { NetworkDetector };
