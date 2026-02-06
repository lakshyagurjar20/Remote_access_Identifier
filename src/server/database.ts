import * as fs from "fs";
import * as path from "path";
import { ClientReport, DatabaseReport } from "./types";

/**
 * DATABASE LAYER (JSON-based)
 * Handles all database operations for storing client reports
 */
export class MonitoringDatabase {
  private dbPath: string;
  private reports: DatabaseReport[] = [];

  constructor(dbPath: string = "./data/monitoring.json") {
    this.dbPath = dbPath;

    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing data
    this.loadData();
    console.log("✅ Database initialized");
  }

  /**
   * Load data from JSON file
   */
  private loadData(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, "utf-8");
        this.reports = JSON.parse(data);
        console.log(`📂 Loaded ${this.reports.length} existing reports`);
      }
    } catch (error) {
      console.error("Error loading database:", error);
      this.reports = [];
    }
  }

  /**
   * Save data to JSON file
   */
  private saveData(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.reports, null, 2));
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  /**
   * Save a client report to the database
   */
  saveReport(report: ClientReport): void {
    const dbReport: DatabaseReport = {
      id: this.reports.length + 1,
      userId: report.userId,
      computerName: report.computerName,
      timestamp: report.timestamp,
      status: report.status,
      severity: report.severity,
      detections: JSON.stringify(report.detections),
      systemInfo: JSON.stringify(report.systemInfo),
    };

    this.reports.push(dbReport);
    this.saveData();
  }

  /**
   * Get recent history for a specific client
   */
  getClientHistory(userId: string, limit: number = 100): DatabaseReport[] {
    return this.reports
      .filter((r) => r.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get all reports (for admin view)
   */
  getAllReports(limit: number = 1000): DatabaseReport[] {
    return this.reports.slice(-limit).reverse();
  }

  /**
   * Get latest report for each client
   */
  getLatestReports(): DatabaseReport[] {
    const latestMap = new Map<string, DatabaseReport>();

    for (const report of this.reports) {
      if (
        !latestMap.has(report.userId) ||
        new Date(report.timestamp) >
          new Date(latestMap.get(report.userId)!.timestamp)
      ) {
        latestMap.set(report.userId, report);
      }
    }

    return Array.from(latestMap.values());
  }

  /**
   * Close database connection (not needed for JSON, but kept for compatibility)
   */
  close(): void {
    this.saveData();
    console.log("💾 Database saved");
  }
}
