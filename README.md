#  Remote Desktop Access Identifier

Real-time detection system for remote desktop software with a modern web UI.

##  Features

-  **30+ Remote Desktop Apps Detected**
  - TeamViewer, AnyDesk, Chrome Remote Desktop
  - VNC variants (UltraVNC, RealVNC, TightVNC)
  - Enterprise tools (LogMeIn, GoToMyPC, Splashtop)
  - And many more!

-  **Triple Detection Method**
  - Process Detection (running applications)
  - Network Detection (active ports with process names)
  - Registry Detection (installed software)

-  **Modern Web UI**
  - Real-time continuous monitoring
  - Live alerts and notifications
  - Color-coded severity indicators
  - Beautiful responsive design

##  Installation

```bash
# Clone the repository
git clone https://github.com/lakshyagurjar20/Remote_access_Identifier
cd Remote_access_identifier

# Install dependencies
npm install
```

##  Usage

### Web UI (Recommended)
```bash
npm run ui
# Open browser: http://localhost:3000
```

### Command Line
```bash
# Single scan
npm start

# Continuous monitoring
npm start -- --continuous
```



##  How It Works

1. **Process Detector**: Scans running processes for known remote desktop applications
2. **Network Detector**: Checks if remote desktop ports are active and identifies the process
3. **Registry Detector**: Examines Windows Registry for installation traces

##  Requirements

- Node.js 14+
- Windows OS (for full registry detection)
- Administrator privileges (recommended)

##  Detection Coverage

- **30+ Applications**
- **80+ Process Names**
- **60+ Registry Keys**
- **40+ Network Ports**

##  Security

This tool is **read-only** and **100% safe**:
- ✅ Only reads system information
- ✅ Never modifies files or registry
- ✅ No data collection or transmission
- ✅ Open source and transparent



##  Author

Created by Lakshya

