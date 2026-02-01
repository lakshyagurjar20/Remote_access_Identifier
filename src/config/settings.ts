import { RemoteDesktopApp, MonitorConfig, AlertConfig } from "../types";

/**
 * KNOWN REMOTE DESKTOP APPLICATIONS
 * This list contains popular remote access tools to detect
 */
export const KNOWN_REMOTE_APPS = [
  {
    name: "TeamViewer",
    processNames: [
      "TeamViewer.exe",
      "TeamViewer_Service.exe",
      "tv_w32.exe",
      "tv_x64.exe",
    ],
    registryKeys: ["SOFTWARE\\TeamViewer", "SOFTWARE\\WOW6432Node\\TeamViewer"],
    commonPorts: [5938, 5939],
    severity: "critical",
  },
  {
    name: "AnyDesk",
    processNames: ["AnyDesk.exe", "AnyDeskService.exe"],
    registryKeys: ["SOFTWARE\\AnyDesk", "SOFTWARE\\WOW6432Node\\AnyDesk"],
    commonPorts: [7070],
    severity: "critical",
  },
  {
    name: "Chrome Remote Desktop",
    processNames: ["remoting_host.exe", "chrome_remote_desktop_host.exe"],
    registryKeys: ["SOFTWARE\\Google\\Chrome Remote Desktop"],
    commonPorts: [443],
    severity: "high",
  },
  {
    name: "Windows RDP",
    processNames: ["mstsc.exe", "RdpSa.exe", "rdpclip.exe"],
    registryKeys: ["SYSTEM\\CurrentControlSet\\Control\\Terminal Server"],
    commonPorts: [3389],
    severity: "critical",
  },
  {
    name: "VNC",
    processNames: [
      "vncviewer.exe",
      "winvnc.exe",
      "tvnserver.exe",
      "vncserver.exe",
    ],
    registryKeys: ["SOFTWARE\\RealVNC", "SOFTWARE\\TightVNC"],
    commonPorts: [5900, 5901, 5902],
    severity: "critical",
  },
  {
    name: "LogMeIn",
    processNames: ["LogMeIn.exe", "LMIGuardianSvc.exe", "LogMeInSystray.exe"],
    registryKeys: ["SOFTWARE\\LogMeIn"],
    commonPorts: [443],
    severity: "high",
  },
  {
    name: "Splashtop",
    processNames: ["Splashtop.exe", "SplashtopService.exe"],
    registryKeys: ["SOFTWARE\\Splashtop"],
    severity: "high",
  },
  {
    name: "GoToMyPC",
    processNames: ["g2mui.exe", "g2tray.exe", "g2pre.exe"],
    registryKeys: ["SOFTWARE\\Citrix\\GoToMyPC"],
    severity: "high",
  },
  {
    name: "Ammyy Admin",
    processNames: ["AA_v3.exe", "AMMYY_Admin.exe"],
    severity: "critical",
  },
  {
    name: "UltraVNC",
    processNames: ["winvnc.exe", "vncviewer.exe", "ultravnc.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\ORL\\WinVNC3", "HKLM\\SOFTWARE\\UltraVNC"],
    commonPorts: [5900, 5800],
    severity: "high" as const,
  },
  {
    name: "RealVNC",
    processNames: ["vncserver.exe", "vncviewer.exe", "realvnc.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\RealVNC", "HKCU\\SOFTWARE\\RealVNC"],
    commonPorts: [5900, 5800],
    severity: "high" as const,
  },
  {
    name: "TightVNC",
    processNames: ["tvnserver.exe", "tvnviewer.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\TightVNC"],
    commonPorts: [5900, 5800],
    severity: "high" as const,
  },

  // Commercial Solutions
  {
    name: "LogMeIn",
    processNames: ["LogMeIn.exe", "LMIGuardianSvc.exe", "ramaint.exe"],
    registryKeys: [
      "HKLM\\SOFTWARE\\LogMeIn",
      "HKLM\\SYSTEM\\CurrentControlSet\\Services\\LogMeIn",
    ],
    commonPorts: [443, 5500],
    severity: "critical" as const,
  },
  {
    name: "GoToMyPC",
    processNames: ["g2comm.exe", "g2pre.exe", "g2svc.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Citrix\\GoToMyPC"],
    commonPorts: [8200],
    severity: "critical" as const,
  },
  {
    name: "Splashtop",
    processNames: ["Splashtop-streamer.exe", "SRFeature.exe", "SRService.exe"],
    registryKeys: [
      "HKLM\\SOFTWARE\\Splashtop Inc.",
      "HKLM\\SOFTWARE\\Splashtop",
    ],
    commonPorts: [6783, 443],
    severity: "critical" as const,
  },
  {
    name: "DameWare",
    processNames: ["dwrcs.exe", "DWRCC.exe", "DameWare.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\SolarWinds\\DameWare"],
    commonPorts: [6129, 6130],
    severity: "high" as const,
  },

  // Free/Open Source
  {
    name: "Ammyy Admin",
    processNames: ["AA_v3.exe", "AMMYY.exe"],
    registryKeys: ["HKCU\\SOFTWARE\\Ammyy"],
    commonPorts: [5931],
    severity: "critical" as const,
  },
  {
    name: "RemotePC",
    processNames: ["RemotePC.exe", "RPCService.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\RemotePC"],
    commonPorts: [443],
    severity: "high" as const,
  },
  {
    name: "ScreenConnect (ConnectWise)",
    processNames: [
      "ScreenConnect.Service.exe",
      "ScreenConnect.ClientService.exe",
    ],
    registryKeys: ["HKLM\\SOFTWARE\\ScreenConnect"],
    commonPorts: [8040, 8041],
    severity: "high" as const,
  },
  {
    name: "Radmin",
    processNames: ["r_server.exe", "Radmin.exe", "RServer3.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Radmin", "HKLM\\SYSTEM\\RAdmin"],
    commonPorts: [4899],
    severity: "critical" as const,
  },
  {
    name: "pcAnywhere",
    processNames: ["awhost32.exe", "awrem32.exe", "pcanywhere.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Symantec\\pcAnywhere"],
    commonPorts: [5631, 5632],
    severity: "high" as const,
  },

  // Cloud-based Solutions
  {
    name: "Zoho Assist",
    processNames: ["ZohoAssist.exe", "ZohoMeeting.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Zoho\\Assist"],
    commonPorts: [443, 8080],
    severity: "high" as const,
  },
  {
    name: "Mikogo",
    processNames: ["Mikogo-Service.exe", "Mikogo.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\BeamYourScreen"],
    commonPorts: [6800],
    severity: "medium" as const,
  },
  {
    name: "ShowMyPC",
    processNames: ["ShowMyPC.exe"],
    registryKeys: ["HKCU\\SOFTWARE\\ShowMyPC"],
    commonPorts: [3999],
    severity: "medium" as const,
  },

  // Enterprise Solutions
  {
    name: "BeyondTrust (Bomgar)",
    processNames: ["bomgar-scc.exe", "bomgar-rep.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Bomgar"],
    commonPorts: [443, 8443],
    severity: "high" as const,
  },
  {
    name: "VNC Connect",
    processNames: ["vncserver.exe", "vncconnect.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\RealVNC\\vncserver"],
    commonPorts: [5900],
    severity: "high" as const,
  },
  {
    name: "NoMachine",
    processNames: ["nxservice.exe", "nxserver.exe", "nxnode.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\NoMachine"],
    commonPorts: [4000, 4080],
    severity: "high" as const,
  },
  {
    name: "RemoteUtilities",
    processNames: ["rutserv.exe", "rfusclient.exe", "rutview.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\Remote Utilities"],
    commonPorts: [5650, 5655],
    severity: "high" as const,
  },
  {
    name: "AeroAdmin",
    processNames: ["AeroAdmin.exe"],
    registryKeys: ["HKCU\\SOFTWARE\\AeroAdmin"],
    commonPorts: [5950],
    severity: "medium" as const,
  },
  {
    name: "FixMe.IT",
    processNames: ["FixMeIT.exe", "FixMeStick.exe"],
    registryKeys: ["HKLM\\SOFTWARE\\TigerVNC"],
    commonPorts: [443],
    severity: "medium" as const,
  },
  {
    name: "GetScreen",
    processNames: ["GetScreen.exe", "gsservice.exe", "GetScreenHost.exe"],
    registryKeys: [
      "HKLM\\SOFTWARE\\GetScreen",
      "HKCU\\SOFTWARE\\GetScreen",
      "HKLM\\SOFTWARE\\WOW6432Node\\GetScreen",
    ],
    commonPorts: [443, 8443],
    severity: "critical" as const,
  },
];

/**
 * MONITORING CONFIGURATION
 * Controls how often to check and what to monitor
 */
export const MONITOR_CONFIG: MonitorConfig = {
  checkInterval: 5000, // Check every 5 seconds
  enableContinuousMonitoring: false, // Set to true for background monitoring
  enableAlerts: true,
  logToFile: true,
  logFilePath: "./logs/detection.log",
};

/**
 * ALERT CONFIGURATION
 * Settings for alerts when remote access is detected
 */
export const ALERT_CONFIG: AlertConfig = {
  enabled: true,
  // Add your webhook URL or email settings here if needed
  webhookUrl: undefined,
  emailRecipients: [],
};

/**
 * REGISTRY KEYS TO CHECK
 * Additional Windows registry locations that might indicate remote access
 */
export const REGISTRY_KEYS_TO_CHECK = [
  {
    hive: "HKLM",
    key: "SYSTEM\\CurrentControlSet\\Control\\Terminal Server",
    value: "fDenyTSConnections",
    description: "Windows Remote Desktop enabled status",
  },
  {
    hive: "HKLM",
    key: "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Terminal Server\\TSAppAllowList",
    value: "fDisabledAllowList",
    description: "RDP App Allow List",
  },
];
