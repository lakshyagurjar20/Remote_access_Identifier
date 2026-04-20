const { KNOWN_REMOTE_APPS, REGISTRY_KEYS_TO_CHECK } = require("../config/settings");

let Registry;
try {
  Registry = require("registry-js");
} catch {
  console.warn("Registry module not available. Registry detection will be limited.");
}

class RegistryDetector {
  async detect() {
    if (process.platform !== "win32") {
      return {
        isDetected: false,
        detectorType: "registry",
        details: "Registry detection only available on Windows",
        timestamp: new Date(),
        severity: "low",
      };
    }

    if (!Registry) {
      return {
        isDetected: false,
        detectorType: "registry",
        details: "Registry module not available",
        timestamp: new Date(),
        severity: "low",
      };
    }

    try {
      const detectedApps = [];

      for (const app of KNOWN_REMOTE_APPS) {
        if (app.registryKeys) {
          for (const keyPath of app.registryKeys) {
            if (this.checkRegistryKey(keyPath)) {
              detectedApps.push(app.name);
              break;
            }
          }
        }
      }

      for (const regKey of REGISTRY_KEYS_TO_CHECK) {
        if (this.checkRegistryKeyDetailed(regKey)) {
          detectedApps.push(regKey.description);
        }
      }

      const uniqueApps = [...new Set(detectedApps)];

      if (uniqueApps.length > 0) {
        return {
          isDetected: true,
          detectorType: "registry",
          details: `Found ${uniqueApps.length} remote desktop registry entry/entries: ${uniqueApps.join(", ")}`,
          timestamp: new Date(),
          severity: this.calculateSeverity(uniqueApps),
          detectedItems: uniqueApps,
        };
      }

      return {
        isDetected: false,
        detectorType: "registry",
        details: "No remote desktop registry entries detected",
        timestamp: new Date(),
        severity: "low",
      };
    } catch (error) {
      return {
        isDetected: false,
        detectorType: "registry",
        details: `Error during registry detection: ${error}`,
        timestamp: new Date(),
        severity: "low",
      };
    }
  }

  checkRegistryKey(keyPath) {
    if (!Registry) return false;
    try {
      const hive = this.getHiveFromPath(keyPath);
      const key = this.getKeyFromPath(keyPath);
      if (!hive || !key) return false;
      return Registry.keyExists(hive, key);
    } catch {
      return false;
    }
  }

  checkRegistryKeyDetailed(regKeyInfo) {
    if (!Registry) return false;
    try {
      return Registry.keyExists(regKeyInfo.hive, regKeyInfo.key);
    } catch {
      return false;
    }
  }

  getHiveFromPath(fullPath) {
    if (fullPath.startsWith("HKEY_LOCAL_MACHINE") || fullPath.startsWith("HKLM")) return "HKLM";
    if (fullPath.startsWith("HKEY_CURRENT_USER") || fullPath.startsWith("HKCU")) return "HKCU";
    if (fullPath.startsWith("HKEY_CLASSES_ROOT") || fullPath.startsWith("HKCR")) return "HKCR";
    return null;
  }

  getKeyFromPath(fullPath) {
    const parts = fullPath.split("\\");
    if (parts.length <= 1) return null;
    return parts.slice(1).join("\\");
  }

  calculateSeverity(detectedApps) {
    if (detectedApps.length >= 3) return "critical";
    if (detectedApps.length >= 2) return "high";
    if (detectedApps.length >= 1) return "medium";
    return "low";
  }

  async isRemoteDesktopConfigured() {
    const result = await this.detect();
    return result.isDetected;
  }
}

module.exports = { RegistryDetector };
