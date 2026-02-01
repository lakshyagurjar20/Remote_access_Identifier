// Detection result from each detector
export interface DetectionResult {
  isDetected: boolean;
  detectorType: "process" | "network" | "registry";
  details: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  detectedItems?: string[];
}

// Combined scan result from all detectors
export interface ScanResult {
  hasRemoteAccess: boolean;
  detections: DetectionResult[];
  scanTime: Date;
  summary: string;
}

// Configuration for monitoring
export interface MonitorConfig {
  checkInterval: number; // in milliseconds
  enableContinuousMonitoring: boolean;
  enableAlerts: boolean;
  logToFile: boolean;
  logFilePath?: string;
}

// Process information
export interface ProcessInfo {
  name: string;
  pid: number;
  path?: string;
}

// Network connection information
export interface NetworkConnection {
  localPort: number;
  remoteAddress?: string;
  state: string;
}

// Alert configuration
export interface AlertConfig {
  enabled: boolean;
  webhookUrl?: string;
  emailRecipients?: string[];
}

// Known remote desktop applications to detect
export interface RemoteDesktopApp {
  name: string;
  processNames: string[];
  registryKeys?: string[];
  commonPorts?: number[];
  severity: "low" | "medium" | "high" | "critical";
}
