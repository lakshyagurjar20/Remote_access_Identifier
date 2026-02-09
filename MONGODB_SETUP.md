# MongoDB Setup Guide

## Prerequisites

You need MongoDB installed and running on your system. Choose one of the following methods:

### Option 1: MongoDB Community Server (Recommended)

1. **Download MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Install with default settings

2. **Start MongoDB Service**

   ```powershell
   # MongoDB should start automatically as a Windows service
   # To check if it's running:
   Get-Service MongoDB

   # If not running, start it:
   Start-Service MongoDB
   ```

3. **Verify MongoDB is Running**

   ```powershell
   # Connect to MongoDB shell
   mongosh

   # You should see MongoDB shell prompt
   # Type 'exit' to leave
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Set environment variable:
   ```powershell
   $env:MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/"
   ```

### Option 3: Docker (If you have Docker installed)

```powershell
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check if running
docker ps
```

## Configuration

The application uses these default MongoDB settings:

- **URI**: `mongodb://localhost:27017` (local MongoDB)
- **Database**: `remote_desktop_monitor`
- **Collection**: `scan_reports`

### Custom Configuration (Optional)

You can override defaults with environment variables:

```powershell
# Set custom MongoDB URI
$env:MONGO_URI="mongodb://your-host:27017"

# Set custom database name
$env:MONGO_DB="my_custom_database"
```

## Running the Application

1. **Ensure MongoDB is running** (see Prerequisites above)

2. **Start the Server**

   ```powershell
   npm run server
   ```

   You should see:

   ```
   ╔════════════════════════════════════════╗
   ║     MONGODB CONFIGURATION              ║
   ╚════════════════════════════════════════╝
     URI:        mongodb://localhost:27017
     Database:   remote_desktop_monitor
     Collection: scan_reports
   ═══════════════════════════════════════════

   ✅ MongoDB connected successfully
      Database: remote_desktop_monitor
      Collection: scan_reports
   📊 Database indexes created
   ```

3. **Start the Client** (in another terminal)

   ```powershell
   npm run client
   ```

4. **Access Admin Dashboard**
   - Open: http://localhost:8082/admin/dashboard.html
   - View real-time client data stored in MongoDB

## Database Features

### Indexes Created Automatically

- `userId` - For fast client lookups
- `timestamp` - For time-based queries
- `userId + timestamp` - Compound index for client history
- `status` - For filtering threats

### Available Operations

- Save reports from clients
- Get client history (last 100 scans)
- Get all reports (last 1000)
- Get latest report per client (using aggregation)
- Get statistics (total clients, threats, etc.)
- Delete old reports (cleanup)

## Viewing Data in MongoDB

### Using MongoDB Shell (mongosh)

```javascript
// Connect
mongosh

// Use the database
use remote_desktop_monitor

// View all reports
db.scan_reports.find().pretty()

// Count total reports
db.scan_reports.countDocuments()

// Find reports for specific client
db.scan_reports.find({ userId: "your-user-id" })

// Find threat detections
db.scan_reports.find({ status: "threat" })

// Get latest 10 reports
db.scan_reports.find().sort({ timestamp: -1 }).limit(10)
```

### Using MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to: `remote_desktop_monitor` → `scan_reports`
4. Browse, query, and analyze data visually

## Troubleshooting

### "MongoDB connection error"

- **Check MongoDB is running**:
  ```powershell
  Get-Service MongoDB
  ```
- **Verify connection string**: Check MONGO_URI environment variable
- **Firewall**: Ensure port 27017 is not blocked

### "Database not connected"

- Server starts before MongoDB connection completes
- Check server console for connection success message
- Ensure MongoDB service is running

### "Authentication failed"

- If using MongoDB Atlas or secured MongoDB, ensure credentials are correct
- Update MONGO_URI with username and password:
  ```
  mongodb://username:password@localhost:27017
  ```

## Migration from JSON Database

Your existing JSON data (`data/monitoring.json`) is no longer used. MongoDB provides:

- ✅ Better performance for large datasets
- ✅ Advanced queries and aggregations
- ✅ Automatic indexing
- ✅ Scalability
- ✅ No file I/O overhead

Old JSON files will remain but won't be updated. You can safely delete `data/monitoring.json` if desired.

## Environment Variables Reference

| Variable          | Description               | Default                     |
| ----------------- | ------------------------- | --------------------------- |
| `MONGO_URI`       | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB`        | Database name             | `remote_desktop_monitor`    |
| `SERVER_URL`      | Server URL for client     | `http://localhost:8082`     |
| `USER_ID`         | Custom client user ID     | Auto-generated              |
| `REPORT_INTERVAL` | Client scan interval (ms) | `10000` (10s)               |
