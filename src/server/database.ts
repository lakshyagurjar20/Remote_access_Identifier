import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { mongoConfig } from "../config/mongoConfig";
import { ClientReport } from "./types";

/**
 * MONGODB DATABASE LAYER
 * Handles all database operations for storing client reports in MongoDB
 */

/**
 * Document structure in MongoDB
 */
export interface ReportDocument {
  _id?: ObjectId;
  userId: string;
  computerName: string;
  timestamp: Date;
  status: "clean" | "threat";
  severity: string;
  detections: any[];
  systemInfo: {
    platform: string;
    hostname: string;
    username: string;
  };
  createdAt: Date;
}

export class MonitoringDatabase {
  private client: MongoClient;
  private db: Db | null = null;
  private reportsCollection: Collection<ReportDocument> | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.client = new MongoClient(mongoConfig.uri);
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(mongoConfig.database);
      this.reportsCollection = this.db.collection<ReportDocument>(
        mongoConfig.collections.reports,
      );

      // Create indexes for better query performance
      await this.createIndexes();

      this.isConnected = true;
      console.log("✅ MongoDB connected successfully");
      console.log(`   Database: ${mongoConfig.database}`);
      console.log(`   Collection: ${mongoConfig.collections.reports}`);
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  private async createIndexes(): Promise<void> {
    if (!this.reportsCollection) return;

    try {
      // Index on userId for faster client-specific queries
      await this.reportsCollection.createIndex({ userId: 1 });

      // Index on timestamp for time-based queries
      await this.reportsCollection.createIndex({ timestamp: -1 });

      // Compound index for userId and timestamp
      await this.reportsCollection.createIndex({ userId: 1, timestamp: -1 });

      // Index on status for filtering threats
      await this.reportsCollection.createIndex({ status: 1 });

      console.log("📊 Database indexes created");
    } catch (error) {
      console.error("Error creating indexes:", error);
    }
  }

  /**
   * Check if database is connected
   */
  private ensureConnected(): void {
    if (!this.isConnected || !this.reportsCollection) {
      throw new Error("Database not connected. Call connect() first.");
    }
  }

  /**
   * Save a client report to MongoDB
   */
  async saveReport(report: ClientReport): Promise<void> {
    this.ensureConnected();

    try {
      const document: ReportDocument = {
        userId: report.userId,
        computerName: report.computerName,
        timestamp: new Date(report.timestamp),
        status: report.status,
        severity: report.severity,
        detections: report.detections,
        systemInfo: report.systemInfo,
        createdAt: new Date(),
      };

      await this.reportsCollection!.insertOne(document);
    } catch (error) {
      console.error("Error saving report to MongoDB:", error);
      throw error;
    }
  }

  /**
   * Get recent history for a specific client
   */
  async getClientHistory(
    userId: string,
    limit: number = 100,
  ): Promise<ReportDocument[]> {
    this.ensureConnected();

    try {
      return await this.reportsCollection!.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error getting client history:", error);
      return [];
    }
  }

  /**
   * Get all reports (for admin view)
   */
  async getAllReports(limit: number = 1000): Promise<ReportDocument[]> {
    this.ensureConnected();

    try {
      return await this.reportsCollection!.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error getting all reports:", error);
      return [];
    }
  }

  /**
   * Get latest report for each client
   */
  async getLatestReports(): Promise<ReportDocument[]> {
    this.ensureConnected();

    try {
      // Use MongoDB aggregation to get the latest report per client
      const pipeline = [
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: "$userId",
            latestReport: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestReport" },
        },
        {
          $sort: { timestamp: -1 },
        },
      ];

      return await this.reportsCollection!.aggregate<ReportDocument>(
        pipeline,
      ).toArray();
    } catch (error) {
      console.error("Error getting latest reports:", error);
      return [];
    }
  }

  /**
   * Get statistics about the database
   */
  async getStats(): Promise<{
    totalReports: number;
    totalClients: number;
    threatsDetected: number;
    cleanSystems: number;
  }> {
    this.ensureConnected();

    try {
      const totalReports = await this.reportsCollection!.countDocuments();

      // Get unique clients count
      const uniqueClients = await this.reportsCollection!.distinct(
        "userId",
      ).then((users) => users.length);

      // Get latest reports to count threats
      const latestReports = await this.getLatestReports();
      const threatsDetected = latestReports.filter(
        (r) => r.status === "threat",
      ).length;
      const cleanSystems = latestReports.filter(
        (r) => r.status === "clean",
      ).length;

      return {
        totalReports,
        totalClients: uniqueClients,
        threatsDetected,
        cleanSystems,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalReports: 0,
        totalClients: 0,
        threatsDetected: 0,
        cleanSystems: 0,
      };
    }
  }

  /**
   * Delete old reports (cleanup)
   */
  async deleteOldReports(daysToKeep: number = 30): Promise<number> {
    this.ensureConnected();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.reportsCollection!.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Error deleting old reports:", error);
      return 0;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      await this.client.close();
      this.isConnected = false;
      console.log("💾 MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
}
