import { LucideIcon, ShieldCheck, AlertTriangle, Activity, Sparkles, Terminal } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: LucideIcon;
}

export interface RiskOverviewItem {
  name: string;
  value: number;
  color: string;
}

export interface FindingDataItem {
  name: string;
  findings: number;
}

export interface VulnerabilityTypeItem {
  name: string;
  progress: number;
  color: string;
}

export interface RecentScanItem {
  target: string;
  scanType: string;
  status: 'Completed' | 'Running' | 'Failed';
  securityScore: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  time: string;
}

export interface ActivityItem {
  id: number;
  type: 'Scan Started' | 'Scan Completed' | 'AI Generated Recommendation' | 'New Critical Finding' | 'GitHub Scan Finished';
  description: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

export const dashboardStats: StatCardProps[] = [
  {
    title: "Security Score",
    value: "92",
    change: "+6%",
    color: "green",
    icon: ShieldCheck,
  },
  {
    title: "Critical Findings",
    value: "12",
    change: "-3",
    color: "red",
    icon: AlertTriangle,
  },
  {
    title: "High Findings",
    value: "24",
    change: "+2",
    color: "blue",
    icon: Activity,
  },
  {
    title: "Medium Findings",
    value: "46",
    change: "+11",
    color: "purple",
    icon: Sparkles,
  },
  {
    title: "Low Findings",
    value: "81",
    change: "+5",
    color: "green",
    icon: ShieldCheck,
  },
];

export const riskOverviewData: RiskOverviewItem[] = [
  { name: "Critical", value: 12, color: "#EF4444" }, // Red-500
  { name: "High", value: 24, color: "#F97316" },     // Orange-500
  { name: "Medium", value: 46, color: "#EAB308" },   // Yellow-500
  { name: "Low", value: 81, color: "#22C55E" },      // Green-500
];

export const findingsChartData: FindingDataItem[] = [
  { name: "Day 1", findings: 20 },
  { name: "Day 2", findings: 25 },
  { name: "Day 3", findings: 18 },
  { name: "Day 4", findings: 30 },
  { name: "Day 5", findings: 22 },
  { name: "Day 6", findings: 28 },
  { name: "Day 7", findings: 35 },
];

export const vulnerabilityTypesData: VulnerabilityTypeItem[] = [
  { name: "Missing Security Headers", progress: 90, color: "#EF4444" },
  { name: "SQL Injection", progress: 75, color: "#F97316" },
  { name: "Cross-Site Scripting", progress: 60, color: "#EAB308" },
  { name: "Weak TLS Configuration", progress: 45, color: "#22C55E" },
  { name: "Exposed Secrets", progress: 80, color: "#3B82F6" },
];

export const recentScansData: RecentScanItem[] = [
  {
    target: "securelens.com",
    scanType: "Website Scan",
    status: "Completed",
    securityScore: 92,
    severity: "Low",
    time: "2 hours ago",
  },
  {
    target: "github.com/securelens",
    scanType: "GitHub Scan",
    status: "Running",
    securityScore: 88,
    severity: "Medium",
    time: "1 hour ago",
  },
  {
    target: "api.securelens.com",
    scanType: "API Scan",
    status: "Completed",
    securityScore: 75,
    severity: "High",
    time: "4 hours ago",
  },
  {
    target: "securelens-mobile-app",
    scanType: "Mobile App Scan",
    status: "Failed",
    securityScore: 60,
    severity: "Critical",
    time: "1 day ago",
  },
];

export const activityFeedData: ActivityItem[] = [
  {
    id: 1,
    type: "Scan Started",
    description: "Website scan for securelens.com initiated",
    time: "2 hours ago",
    icon: Activity,
    color: "#A78BFA", // Purple
  },
  {
    id: 2,
    type: "New Critical Finding",
    description: "SQL Injection vulnerability found in securelens.com",
    time: "1 hour ago",
    icon: AlertTriangle,
    color: "#EF4444", // Red
  },
  {
    id: 3,
    type: "AI Generated Recommendation",
    description: "AI Copilot generated a fix for XSS vulnerability",
    time: "30 minutes ago",
    icon: Sparkles,
    color: "#3B82F6", // Blue
  },
  {
    id: 4,
    type: "GitHub Scan Finished",
    description: "GitHub repository scan for 'securelens' completed",
    time: "15 minutes ago",
    icon: Terminal,
    color: "#22C55E", // Green
  },
  {
    id: 5,
    type: "Scan Completed",
    description: "Website scan for securelens.com completed",
    time: "10 minutes ago",
    icon: ShieldCheck,
    color: "#A78BFA", // Purple
  },
];
