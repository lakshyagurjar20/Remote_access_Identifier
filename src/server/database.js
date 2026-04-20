const { MongoClient } = require("mongodb");
const { mongoConfig } = require("../config/mongoConfig");

class MonitoringDatabase {
  constructor() {
    this.client = new MongoClient(mongoConfig.uri);
    this.db = null;
    this.reportsCollection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(mongoConfig.database);
      this.reportsCollection = this.db.collection(mongoConfig.collections.reports);
      await this.createIndexes();
      this.isConnected = true;
      console.log(" MongoDB connected successfully");
      console.log(`   Database: ${mongoConfig.database}`);
      console.log(`   Collection: ${mongoConfig.collections.reports}`);
    } catch (error) {
      console.error(" MongoDB connection error:", error);
      throw error;
    }
  }

  async createIndexes() {
    if (!this.reportsCollection) return;
    try {
      await this.reportsCollection.createIndex({ userId: 1 });
      await this.reportsCollection.createIndex({ timestamp: -1 });
      await this.reportsCollection.createIndex({ userId: 1, timestamp: -1 });
      await this.reportsCollection.createIndex({ status: 1 });
      console.log(" Database indexes created");
    } catch (error) {
      console.error("Error creating indexes:", error);
    }
  }

  ensureConnected() {
    if (!this.isConnected || !this.reportsCollection) {
      throw new Error("Database not connected. Call connect() first.");
    }
  }

  async saveReport(report) {
    this.ensureConnected();
    try {
      const document = {
        userId: report.userId,
        computerName: report.computerName,
        timestamp: new Date(report.timestamp),
        status: report.status,
        severity: report.severity,
        detections: report.detections,
        systemInfo: report.systemInfo,
        createdAt: new Date(),
      };
      await this.reportsCollection.insertOne(document);
    } catch (error) {
      console.error("Error saving report to MongoDB:", error);
      throw error;
    }
  }

  async getClientHistory(userId, limit = 100) {
    this.ensureConnected();
    try {
      return await this.reportsCollection.find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray();
    } catch (error) {
      console.error("Error getting client history:", error);
      return [];
    }
  }

  async getAllReports(limit = 1000) {
    this.ensureConnected();
    try {
      return await this.reportsCollection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
    } catch (error) {
      console.error("Error getting all reports:", error);
      return [];
    }
  }

  async getLatestReports() {
    this.ensureConnected();
    try {
      const pipeline = [
        { $sort: { timestamp: -1 } },
        { $group: { _id: "$userId", latestReport: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$latestReport" } },
        { $sort: { timestamp: -1 } },
      ];
      return await this.reportsCollection.aggregate(pipeline).toArray();
    } catch (error) {
      console.error("Error getting latest reports:", error);
      return [];
    }
  }

  async getStats() {
    this.ensureConnected();
    try {
      const totalReports = await this.reportsCollection.countDocuments();
      const totalClients = await this.reportsCollection.distinct("userId").then((u) => u.length);
      const latestReports = await this.getLatestReports();
      return {
        totalReports,
        totalClients,
        threatsDetected: latestReports.filter((r) => r.status === "threat").length,
        cleanSystems: latestReports.filter((r) => r.status === "clean").length,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return { totalReports: 0, totalClients: 0, threatsDetected: 0, cleanSystems: 0 };
    }
  }

  async deleteOldReports(daysToKeep = 30) {
    this.ensureConnected();
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const result = await this.reportsCollection.deleteMany({ timestamp: { $lt: cutoffDate } });
      return result.deletedCount;
    } catch (error) {
      console.error("Error deleting old reports:", error);
      return 0;
    }
  }

  async close() {
    try {
      await this.client.close();
      this.isConnected = false;
      console.log(" MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
}

module.exports = { MonitoringDatabase };
