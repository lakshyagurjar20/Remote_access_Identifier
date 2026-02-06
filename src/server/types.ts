/**
 * TYPE DEFINITIONS FOR CENTRAL SERVER
 */

import { DetectionResult } from "../types";

/**
 * Report sent from client to server
 */
export interface ClientReport {
  userId: string;
  computerName: string;
  timestamp: string;
  status: "clean" | "threat";
  severity: string;
  detections: DetectionResult[];
  systemInfo: {
    platform: string;
    hostname: string;
    username: string;
  };
}

/**
 * Extended client status with connection info
 */
export interface ClientStatus extends ClientReport {
  lastSeen: Date;
  isOnline: boolean;
}

/**
 * Database record structure
 */
export interface DatabaseReport {
  id?: number;
  userId: string;
  computerName: string;
  timestamp: string;
  status: string;
  severity: string;
  detections: string; // JSON string
  systemInfo: string; // JSON string
}
