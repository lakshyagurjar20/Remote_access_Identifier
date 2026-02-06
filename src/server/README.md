# Central Monitoring Server

The central server collects reports from all connected clients and provides an admin API.

## Installation

First, install the new dependencies:

```bash
npm install
```

## Usage

### Start the Server

```bash
npm run server
```

The server will start on `http://localhost:4000`

## API Endpoints

### Client Endpoints

#### POST /api/client/report

Receive detection report from a client.

**Request Body:**

```json
{
  "userId": "LAPTOP-123-1234567890",
  "computerName": "LAPTOP-123",
  "timestamp": "2026-02-06T10:00:00.000Z",
  "status": "threat",
  "severity": "critical",
  "detections": [...],
  "systemInfo": {
    "platform": "win32",
    "hostname": "LAPTOP-123",
    "username": "user"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report received"
}
```

### Admin Endpoints

#### GET /api/admin/stats

Get overall statistics.

**Response:**

```json
{
  "totalClients": 5,
  "onlineClients": 3,
  "threatsDetected": 1,
  "cleanSystems": 4
}
```

#### GET /api/admin/clients

Get all connected clients.

**Response:**

```json
{
  "clients": [
    {
      "userId": "LAPTOP-123-1234567890",
      "computerName": "LAPTOP-123",
      "status": "threat",
      "isOnline": true,
      "lastSeen": "2026-02-06T10:00:00.000Z",
      ...
    }
  ]
}
```

#### GET /api/admin/clients/:userId

Get specific client details with history.

**Response:**

```json
{
  "client": {...},
  "history": [...]
}
```

#### GET /api/admin/reports?limit=100

Get all reports from database.

**Query Parameters:**

- `limit` - Number of reports to retrieve (default: 1000)

## Features

- ✅ **Real-time Monitoring** - Track all connected clients
- ✅ **SQLite Database** - All reports stored permanently
- ✅ **Online/Offline Detection** - 30-second timeout
- ✅ **Threat Alerts** - Console alerts when threats detected
- ✅ **Historical Data** - Access past reports for any client
- ✅ **REST API** - Easy integration with admin dashboard

## Database

- **Location:** `./data/monitoring.db`
- **Type:** SQLite
- **Auto-created** on first run

## How It Works

1. Server starts and initializes database
2. Clients send reports every 10 seconds
3. Server stores reports in database
4. Server maintains in-memory cache of online clients
5. Admin can query stats and client details via API
6. Automatic alerts for detected threats

## Stopping the Server

Press `Ctrl+C` to gracefully stop the server.
