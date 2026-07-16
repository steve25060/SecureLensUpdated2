import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    const now = new Date();
    const findingsOverTime = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        critical: Math.floor(Math.random() * 5) + 1,
        high: Math.floor(Math.random() * 15) + 5,
        medium: Math.floor(Math.random() * 20) + 10,
        low: Math.floor(Math.random() * 30) + 15,
        info: Math.floor(Math.random() * 10) + 2,
      };
    });

    return {
      totalScans: 24,
      assetsScanned: 1248,
      totalFindings: 142,
      criticalFindings: 18,
      avgRiskScore: 72,
      findingsOverTime,
      findingsBySeverity: [
        { name: 'Critical', value: 18, color: '#ef4444' },
        { name: 'High', value: 42, color: '#f97316' },
        { name: 'Medium', value: 52, color: '#eab308' },
        { name: 'Low', value: 30, color: '#22c55e' },
        { name: 'Info', value: 12, color: '#3b82f6' },
      ],
      topVulnerabilityCategories: [
        { name: 'Injection Flaws', count: 36, percentage: 25.6 },
        { name: 'Broken Access Control', count: 29, percentage: 20.9 },
        { name: 'Security Misconfigurations', count: 26, percentage: 18.6 },
        { name: 'XSS', count: 23, percentage: 16.3 },
        { name: 'Others', count: 26, percentage: 18.6 },
      ],
      recentScansPerformance: [
        { workspace: 'acme.com', scanType: 'Website Analysis', status: 'COMPLETED', findings: 22, riskScore: 85, duration: '12m 45s', completedAt: '10:30 AM' },
        { workspace: 'vulnerable-app', scanType: 'Full Scan', status: 'COMPLETED', findings: 18, riskScore: 68, duration: '24m 12s', completedAt: '09:15 AM' },
        { workspace: 'staging.acme.com', scanType: 'Vulnerability Scan', status: 'COMPLETED', findings: 8, riskScore: 45, duration: '8m 22s', completedAt: '08:45 AM' },
        { workspace: 'shopify-clone', scanType: 'Website Analysis', status: 'COMPLETED', findings: 5, riskScore: 32, duration: '6m 18s', completedAt: '11:20 PM' },
        { workspace: 'api.acme.com', scanType: 'API Scan', status: 'COMPLETED', findings: 3, riskScore: 28, duration: '9m 5s', completedAt: '10:10 PM' },
      ],
    };
  }
}
