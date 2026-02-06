# Client Agent

The client agent runs on user's PC and monitors for remote desktop access.

## Usage

### Basic Usage

```bash
npm run client
```

### With Custom Server URL

```bash
SERVER_URL=http://your-server.com:4000 npm run client
```

### With Custom User ID

```bash
USER_ID=my-unique-id npm run client
```

### With Custom Report Interval (in milliseconds)

```bash
REPORT_INTERVAL=5000 npm run client
```

### All Options Together

```bash
SERVER_URL=http://your-server.com:4000 USER_ID=laptop-001 REPORT_INTERVAL=5000 npm run client
```

## Environment Variables

| Variable          | Description                       | Default                      |
| ----------------- | --------------------------------- | ---------------------------- |
| `SERVER_URL`      | Central server URL                | `http://localhost:8082`      |
| `USER_ID`         | Unique identifier for this client | Auto-generated from hostname |
| `REPORT_INTERVAL` | Report interval in milliseconds   | `10000` (10 seconds)         |

## How It Works

1. Client loads configuration from environment variables
2. Starts monitoring local system every 10 seconds (default)
3. Detects remote desktop software using 3 methods:
   - Process detection
   - Network port detection
   - Registry detection
4. Reports findings to central server
5. Runs continuously until stopped with Ctrl+C

## Stopping the Client

Press `Ctrl+C` to gracefully stop the client agent.
