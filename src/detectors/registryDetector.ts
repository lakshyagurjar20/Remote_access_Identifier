import { DetectionResult } from "../types";
import { KNOWN_REMOTE_APPS, REGISTRY_KEYS_TO_CHECK } from "../config/settings";

// Note: registry-js might not work on all systems
// We'll use a try-catch approach to handle this gracefully
let Registry: any;
try {
  Registry = require("registry-js");
} catch (error) {
  console.warn(
    "Registry module not available. Registry detection will be limited.",
  );
}

/**
 * REGISTRY DETECTOR
 * Scans Windows Registry for entries indicating remote desktop software installation
 * Even if software isn't running, registry entries show it's installed
 */
export class RegistryDetector {
  /**
   * Main detection method - scans registry for remote desktop apps
   */
  async detect(): Promise<DetectionResult> {
    // Check if we're on Windows
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
      const detectedApps: string[] = [];

      // Check each known remote app's registry keys
      for (const app of KNOWN_REMOTE_APPS) {
        if (app.registryKeys) {
          for (const keyPath of app.registryKeys) {
            if (this.checkRegistryKey(keyPath)) {
              detectedApps.push(app.name);
              break; // No need to check other keys for this app
            }
          }
        }
      }

      // Also check additional registry keys
      for (const regKey of REGISTRY_KEYS_TO_CHECK) {
        if (this.checkRegistryKeyDetailed(regKey)) {
          detectedApps.push(regKey.description);
        }
      }

      // Remove duplicates
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

  /**
   * Check if a registry key exists (simple path check)
   */
  private checkRegistryKey(keyPath: string): boolean {
    if (!Registry) return false;

    try {
      // Parse the key path
      const hive = this.getHiveFromPath(keyPath);
      const key = this.getKeyFromPath(keyPath);

      if (!hive || !key) return false;

      // Check if key exists
      return Registry.keyExists(hive, key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check registry key with detailed information
   */
  private checkRegistryKeyDetailed(regKeyInfo: any): boolean {
    if (!Registry) return false;

    try {
      return Registry.keyExists(regKeyInfo.hive, regKeyInfo.key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract registry hive from full path
   */
  private getHiveFromPath(fullPath: string): string | null {
    if (
      fullPath.startsWith("HKEY_LOCAL_MACHINE") ||
      fullPath.startsWith("HKLM")
    ) {
      return "HKLM";
    } else if (
      fullPath.startsWith("HKEY_CURRENT_USER") ||
      fullPath.startsWith("HKCU")
    ) {
      return "HKCU";
    } else if (
      fullPath.startsWith("HKEY_CLASSES_ROOT") ||
      fullPath.startsWith("HKCR")
    ) {
      return "HKCR";
    }
    return null;
  }

  /**
   * Extract key path from full path
   */
  private getKeyFromPath(fullPath: string): string | null {
    const parts = fullPath.split("\\");
    if (parts.length <= 1) return null;

    // Remove the hive part and join the rest
    return parts.slice(1).join("\\");
  }

  /**
   * Calculate severity based on what was found
   */
  private calculateSeverity(
    detectedApps: string[],
  ): "low" | "medium" | "high" | "critical" {
    if (detectedApps.length >= 3) return "critical";
    if (detectedApps.length >= 2) return "high";
    if (detectedApps.length >= 1) return "medium";
    return "low";
  }

  /**
   * Quick check - returns true if any remote desktop registry entries exist
   */
  async isRemoteDesktopConfigured(): Promise<boolean> {
    const result = await this.detect();
    return result.isDetected;
  }
}
