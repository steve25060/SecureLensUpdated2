import { Injectable, Logger } from '@nestjs/common';
import { UnifiedFinding, FindingSeverity } from '@securelens/findings-schema';

/**
 * Risk Intelligence Engine
 * 
 * Calculates contextual risk scores based on multiple factors
 * including severity, exploitability, asset exposure, and correlated issues
 */

@Injectable()
export class RiskIntelligenceEngineService {
  private readonly logger = new Logger(RiskIntelligenceEngineService.name);

  /**
   * Calculate risk score for a finding
   * Range: 0-100
   */
  calculateFindingRisk(finding: UnifiedFinding): number {
    let score = 0;

    // Base severity score (40%)
    const severityScore = this.getSeverityScore(finding.severity);
    score += severityScore * 0.4;

    // Exploitability score (25%)
    const exploitabilityScore = this.getExploitabilityScore(finding);
    score += exploitabilityScore * 0.25;

    // Asset exposure score (20%)
    const exposureScore = this.getExposureScore(finding);
    score += exposureScore * 0.2;

    // Correlation impact (10%)
    const correlationScore = this.getCorrelationScore(finding);
    score += correlationScore * 0.1;

    // Known CVE bonus (5%)
    if (finding.cve || finding.cvss) {
      score += 5;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Get severity score (0-100)
   */
  private getSeverityScore(severity: FindingSeverity): number {
    const scores = {
      [FindingSeverity.CRITICAL]: 100,
      [FindingSeverity.HIGH]: 75,
      [FindingSeverity.MEDIUM]: 50,
      [FindingSeverity.LOW]: 25,
      [FindingSeverity.INFO]: 5,
    };
    return scores[severity] || 0;
  }

  /**
   * Get exploitability score (0-100)
   */
  private getExploitabilityScore(finding: UnifiedFinding): number {
    let score = 50; // Base

    // CVSS score provides exploitability data
    if (finding.cvss) {
      // CVSS ranges from 0-10, scale to 0-100
      score = (finding.cvss / 10) * 100;
    }

    // Explicitly marked as exploitable
    if (
      finding.exploitability === 'critical' ||
      finding.exploitability === 'high'
    ) {
      score = Math.max(score, 85);
    } else if (finding.exploitability === 'medium') {
      score = Math.max(score, 60);
    } else if (finding.exploitability === 'low') {
      score = Math.max(score, 30);
    }

    // Check for evidence of active exploitation
    if (
      finding.evidence &&
      (finding.evidence.toLowerCase().includes('exploited') ||
        finding.evidence.toLowerCase().includes('rce'))
    ) {
      score = Math.max(score, 90);
    }

    return Math.min(100, score);
  }

  /**
   * Get asset exposure score (0-100)
   * Based on whether target is internet-facing, etc.
   */
  private getExposureScore(finding: UnifiedFinding): number {
    let score = 50;

    // Internet-facing assets have higher exposure
    if (finding.targetUrl) {
      const url = finding.targetUrl.toLowerCase();

      if (
        url.includes('public') ||
        url.includes('external') ||
        url.includes('api')
      ) {
        score = 85;
      } else if (url.includes('localhost') || url.includes('internal')) {
        score = 25;
      } else {
        score = 70; // Regular web asset
      }
    }

    // Port exposure
    if (finding.targetPort) {
      if ([80, 443, 8080, 8443].includes(finding.targetPort)) {
        score = Math.max(score, 75);
      } else {
        score = Math.max(score, 50);
      }
    }

    // Authentication bypass = higher exposure
    if (
      finding.category === 'authentication' ||
      finding.title.toLowerCase().includes('bypass')
    ) {
      score = Math.min(100, score + 20);
    }

    return Math.min(100, score);
  }

  /**
   * Get correlation score (0-100)
   * Multiple related issues compound risk
   */
  private getCorrelationScore(finding: UnifiedFinding): number {
    let score = 0;

    if (!finding.correlatedFindingIds) {
      return 0;
    }

    const correlationCount = finding.correlatedFindingIds.length;

    if (correlationCount === 0) {
      return 0;
    } else if (correlationCount === 1) {
      return 25;
    } else if (correlationCount === 2) {
      return 50;
    } else if (correlationCount >= 3) {
      return 100;
    }

    return score;
  }

  /**
   * Classify risk level
   */
  classifyRiskLevel(
    riskScore: number,
  ): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'info';
  }

  /**
   * Calculate aggregate risk for multiple findings
   */
  calculateAggregateRisk(findings: UnifiedFinding[]): {
    overallScore: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    riskTrend: 'improving' | 'stable' | 'deteriorating';
    recommendation: string;
  } {
    if (findings.length === 0) {
      return {
        overallScore: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        riskTrend: 'stable',
        recommendation: 'No findings detected',
      };
    }

    const scores = findings.map((f) => this.calculateFindingRisk(f));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);

    // Weighted score: prioritize critical issues
    const weightedScore =
      (avgScore * 0.4 + maxScore * 0.4 + (scores.filter((s) => s > 75).length * 10) * 0.2) /
      1.2;

    // Count by level
    const risks = findings.map((f) => this.classifyRiskLevel(this.calculateFindingRisk(f)));
    const counts = {
      critical: risks.filter((r) => r === 'critical').length,
      high: risks.filter((r) => r === 'high').length,
      medium: risks.filter((r) => r === 'medium').length,
      low: risks.filter((r) => r === 'low').length,
      info: risks.filter((r) => r === 'info').length,
    };

    return {
      overallScore: Math.round(Math.min(100, weightedScore)),
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      infoCount: counts.info,
      riskTrend: this.calculateTrend(counts),
      recommendation: this.getRecommendation(counts, Math.round(weightedScore)),
    };
  }

  /**
   * Calculate risk trend
   */
  private calculateTrend(
    counts: Record<string, number>,
  ): 'improving' | 'stable' | 'deteriorating' {
    if (counts.critical > 0) {
      return 'deteriorating';
    }
    if (counts.high > 3) {
      return 'deteriorating';
    }
    if (counts.high === 0 && counts.medium === 0) {
      return 'improving';
    }
    return 'stable';
  }

  /**
   * Get risk recommendation
   */
  private getRecommendation(
    counts: Record<string, number>,
    score: number,
  ): string {
    if (counts.critical > 0) {
      return `Immediate action required: ${counts.critical} critical issue(s) detected. Remediate within 24 hours.`;
    }
    if (score >= 80) {
      return `High security risk: ${counts.high} high-severity issues require urgent attention.`;
    }
    if (score >= 60) {
      return `Moderate risk: ${counts.medium} medium-severity issues should be addressed within 1-2 weeks.`;
    }
    if (score >= 40) {
      return `Low-moderate risk: Plan remediation within 30 days.`;
    }
    return 'Overall security posture is good. Continue monitoring.';
  }

  /**
   * Get risk metrics by category
   */
  getRiskByCategory(findings: UnifiedFinding[]): Record<string, number> {
    const categoryRisks: Record<string, number[]> = {};

    findings.forEach((finding) => {
      if (!categoryRisks[finding.category]) {
        categoryRisks[finding.category] = [];
      }
      categoryRisks[finding.category].push(this.calculateFindingRisk(finding));
    });

    const result: Record<string, number> = {};
    for (const [category, scores] of Object.entries(categoryRisks)) {
      result[category] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    }

    return result;
  }

  /**
   * Get risk metrics by engine
   */
  getRiskByEngine(findings: UnifiedFinding[]): Record<string, number> {
    const engineRisks: Record<string, number[]> = {};

    findings.forEach((finding) => {
      if (!engineRisks[finding.engine]) {
        engineRisks[finding.engine] = [];
      }
      engineRisks[finding.engine].push(this.calculateFindingRisk(finding));
    });

    const result: Record<string, number> = {};
    for (const [engine, scores] of Object.entries(engineRisks)) {
      result[engine] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    }

    return result;
  }
}
