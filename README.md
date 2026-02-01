# 🔍 Remote Desktop Access Identifier

A comprehensive TypeScript-based security tool that detects remote desktop applications and services running on a Windows system. Perfect for monitoring during online exams, assessments, or security audits.

## 📋 Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Detection Methods](#detection-methods)
- [Understanding the Output](#understanding-the-output)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Multi-Layer Detection**: Uses three independent detection methods for comprehensive coverage
- **Process Detection**: Scans running processes for remote desktop applications
- **Network Detection**: Monitors network ports commonly used by remote access tools
- **Registry Detection**: Checks Windows Registry for installed remote desktop software
- **Real-time Monitoring**: Continuous monitoring mode for ongoing surveillance
- **Colored Console Output**: Easy-to-read, color-coded results
- **File Logging**: Maintains detailed logs of all detections
- **Severity Classification**: Rates detected threats from low to critical

## 🔧 How It Works

### 1. **Process Detector**

Scans all running processes and compares them against a database of known remote desktop applications:

- TeamViewer
- AnyDesk
- Chrome Remote Desktop
- Windows RDP (Remote Desktop Protocol)
- VNC (Virtual Network Computing)
- LogMeIn
- And more...

### 2. **Network Detector**

Checks if common remote desktop ports are active:

- Port 3389 (Windows RDP)
- Port 5900-5902 (VNC)
- Port 5938-5939 (TeamViewer)
- Port 7070 (AnyDesk)

### 3. **Registry Detector**

Searches Windows Registry for entries indicating installed remote desktop software, even if not currently running.

## 📦 Installation

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Windows OS** (Registry detection only works on Windows)
- **Administrator privileges** (recommended for full detection capabilities)

### Step 1: Navigate to the project directory

```bash
cd c:\Users\laksh\OneDrive\Desktop\Projects\Project_Remote\remote-desktop-detector
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Build the project (optional)

```bash
npm run build
```

## 🚀 Usage

### Single Scan Mode

Run a one-time scan to check for remote desktop access:

```bash
npm start
```

**What happens:**

- Scans all running processes
- Checks network ports
- Examines registry entries
- Displays results with color coding
- Exits with status code (0 = clean, 1 = detected)

### Continuous Monitoring Mode

Run ongoing monitoring (ideal for exam/assessment scenarios):

```bash
npm start -- --continuous
```

**What happens:**

- Runs scans every 5 seconds (configurable)
- Continues until you press Ctrl+C
- Logs all detections to file
- Sends alerts when remote access is detected

### Development Mode

For development with auto-reload:

```bash
npm run dev
```

### Display Help

```bash
npm start -- --help
```

## ⚙️ Configuration

Edit [src/config/settings.ts](src/config/settings.ts) to customize behavior:

### Monitoring Interval

```typescript
checkInterval: 5000; // Check every 5 seconds (5000ms)
```

### Enable/Disable Features

```typescript
enableContinuousMonitoring: true,
enableAlerts: true,
logToFile: true
```

### Log File Location

```typescript
logFilePath: "./logs/detection.log";
```

### Add Custom Remote Apps

```typescript
{
    name: 'My Custom App',
    processNames: ['myapp.exe'],
    registryKeys: ['SOFTWARE\\MyApp'],
    commonPorts: [8080],
    severity: 'high'
}
```

## 🔍 Detection Methods

### Detected Applications

| Application           | Process Names                          | Ports      | Severity |
| --------------------- | -------------------------------------- | ---------- | -------- |
| TeamViewer            | TeamViewer.exe, TeamViewer_Service.exe | 5938, 5939 | Critical |
| AnyDesk               | AnyDesk.exe, AnyDeskService.exe        | 7070       | Critical |
| Windows RDP           | mstsc.exe, rdpclip.exe                 | 3389       | Critical |
| VNC                   | vncviewer.exe, winvnc.exe              | 5900-5902  | Critical |
| Chrome Remote Desktop | remoting_host.exe                      | 443        | High     |
| LogMeIn               | LogMeIn.exe                            | 443        | High     |

## 📊 Understanding the Output

### Clean System Example

```
==================================================================
SCAN SUMMARY - 1/24/2026, 10:30:00 AM
Status: CLEAN
Summary: No remote desktop access detected. System is clean.
==================================================================
```

### Detection Example

```
==================================================================
SCAN SUMMARY - 1/24/2026, 10:30:00 AM
Status: DETECTED
Summary: Remote desktop access DETECTED! Found 2 indicator(s).

Detailed Results:
  1. [process] Found 1 remote desktop application(s) running: TeamViewer
  2. [network] Found 1 active remote desktop port(s): 5938
==================================================================
```

### Severity Levels

- 🟢 **LOW**: Informational, no action needed
- 🟡 **MEDIUM**: Minor concern, worth investigating
- 🔴 **HIGH**: Serious concern, immediate attention recommended
- ⛔ **CRITICAL**: Definite remote access detected, immediate action required

## 📝 Log Files

Logs are saved to `./logs/detection.log` by default:

```
[INFO] 2026-01-24T10:30:00.000Z - Starting remote desktop detection scan...
[DETECTION] PROCESS - Found 1 remote desktop application(s) running: TeamViewer
[WARNING] 2026-01-24T10:30:01.000Z - Remote desktop access detected!
```

## 🛠️ Troubleshooting

### "Registry module not available"

**Solution**: Run the following command:

```bash
npm install registry-js
```

### "Error during process detection"

**Solution**: Run PowerShell/Command Prompt as Administrator

### No detections but remote software is installed

**Possible reasons:**

1. Software is installed but not running (Process detector won't catch it)
2. Software uses non-standard port (Network detector won't catch it)
3. Registry detection disabled or failed

**Solution**: Ensure all three detection methods are working

### Continuous monitoring not stopping

**Solution**: Press `Ctrl+C` in the terminal

## 🧪 Testing

The project includes test files for validation:

```bash
npm test
```

## 📁 Project Structure

```
remote-desktop-detector/
├── src/
│   ├── main.ts                    # Entry point
│   ├── config/
│   │   └── settings.ts            # Configuration & known apps
│   ├── detectors/
│   │   ├── processDetector.ts     # Process scanning
│   │   ├── networkDetector.ts     # Port scanning
│   │   └── registryDetector.ts    # Registry checking
│   ├── monitors/
│   │   ├── sessionMonitor.ts      # Single scan logic
│   │   └── continuousMonitor.ts   # Continuous monitoring
│   ├── reporters/
│   │   ├── logger.ts              # Logging system
│   │   └── alertService.ts        # Alert notifications
│   └── types/
│       └── index.ts               # TypeScript types
├── tests/                         # Test files
├── logs/                          # Log output directory
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

## 🔐 Security & Privacy

- This tool is designed for **legitimate security monitoring** only
- Use only on systems you own or have permission to monitor
- Does not capture sensitive data or screenshots
- Only detects presence of remote desktop software

## 📄 License

MIT License - Feel free to use and modify for your needs

## 🤝 Contributing

Contributions are welcome! To add support for new remote desktop applications:

1. Edit [src/config/settings.ts](src/config/settings.ts)
2. Add the application to `KNOWN_REMOTE_APPS` array
3. Include process names, registry keys, and ports
4. Test thoroughly

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review log files in `./logs/detection.log`
3. Ensure you're running with Administrator privileges
4. Verify all dependencies are installed

---

**Built for educational and security purposes** 🎓🔒
