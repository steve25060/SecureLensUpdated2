import { Injectable, Logger } from '@nestjs/common';
import { UnifiedFinding, FindingCategory, FindingSeverity } from '@securelens/findings-schema';

/**
 * Security Scoring Engine
 * 
 * Generates comprehensive security scores across different domains
 * to provide a clear picture of the application's security posture
 */

export interface SecurityScore {
  overall: number;
  authentication: number;
  apiSecurity: number;
  headerSecurity: number;
  cookieSecurity: number;
  dependencySecurity: number;
  secretSecurity: number;
  infrastructureSecurity: number;
  codeQuality: number;
  timestamp: Date;
}

@Injectable()
export class SecurityScoringEngineService {
  private readonly logger = new Logger(SecurityScoringEngineService.name);

  /**
   * Calculate comprehensive security scores
   */
  calculateSecurityScores(findings: UnifiedFinding[]): SecurityScore {
    const scores = {
      overall: 100,
      authentication: 100,
      apiSecurity: 100,
      headerSecurity: 100,
      cookieSecurity: 100,
      dependencySecurity: 100,
      secretSecurity: 100,
      infrastructureSecurity: 100,
      codeQuality: 100,
      timestamp: new Date(),
    };

    if (findings.length === 0) {
      return scores;
    }

    // Calculate category scores
    scores.authentication = this.calculateCategoryScore(
      findings,
      FindingCategory.AUTHENTICATION,
    );
    scores.apiSecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.API_SECURITY,
    );
    scores.headerSecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.HEADERS,
    );
    scores.cookieSecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.COOKIES,
    );
    scores.dependencySecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.DEPENDENCIES,
    );
    scores.secretSecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.SECRETS,
    );
    scores.infrastructureSecurity = this.calculateCategoryScore(
      findings,
      FindingCategory.INFRASTRUCTURE,
    );
    scores.codeQuality = this.calculateCategoryScore(
      findings,
      FindingCategory.CODE_QUALITY,
    );

    // Calculate overall score (weighted average)
    scores.overall = this.calculateOverallScore(scores);

    this.logger.log(`Security scores calculated: Overall ${scores.overall}`);

    return scores;
  }

  /**
   * Calculate score for a specific category
   */
  private calculateCategoryScore(
    findings: UnifiedFinding[],
    category: FindingCategory,
  ): number {
    const categoryFindings = findings.filter((f) => f.category === category);

    if (categoryFindings.length === 0) {
      return 100; // No findings = perfect score
    }

    let penalty = 0;

    categoryFindings.forEach((finding) => {
      const severityPenalty = this.getSeverityPenalty(finding.severity);
      penalty += severityPenalty;
    });

    // Normalize penalty to 0-100 scale
    const score = Math.max(0, 100 - penalty);
    return Math.round(score);
  }

  /**
   * Get penalty for a severity level
   */
  private getSeverityPenalty(severity: FindingSeverity): number {
    const penalties = {
      [FindingSeverity.CRITICAL]: 25,
      [FindingSeverity.HIGH]: 15,
      [FindingSeverity.MEDIUM]: 8,
      [FindingSeverity.LOW]: 3,
      [FindingSeverity.INFO]: 1,
    };
    return penalties[severity] || 0;
  }

  /**
   * Calculate overall score from category scores
   */
  private calculateOverallScore(scores: Omit<SecurityScore, 'overall' | 'timestamp'>): number {
    // Weights for each category
    const weights = {
      authentication: 0.20,
      apiSecurity: 0.15,
      headerSecurity: 0.12,
      cookieSecurity: 0.10,
      dependencySecurity: 0.15,
      secretSecurity: 0.18,
      infrastructureSecurity: 0.05,
      codeQuality: 0.05,
    };

    let weighted = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      weighted += (scores[key] || 100) * weight;
      totalWeight += weight;
    });

    return Math.round(weighted / totalWeight);
  }

  /**
   * Get security posture grade (A-F)
   */
  getSecurityGrade(overallScore: number): string {
    if (overallScore >= 90) return 'A';
    if (overallScore >= 80) return 'B';
    if (overallScore >= 70) return 'C';
    if (overallScore >= 60) return 'D';
    return 'F';
  }

  /**
   * Get score trend over time (mock implementation)
   */
  getScoreTrend(scores: SecurityScore[]): {
    trend: 'improving' | 'stable' | 'declining';
    percentageChange: number;
    lastWeekAverage: number;
  } {
    if (scores.length < 2) {
      return { trend: 'stable', percentageChange: 0, lastWeekAverage: scores[0]?.overall || 100 };
    }

    const recentScores = scores.slice(-7); // Last 7 readings
    const olderScores = scores.slice(0, -7) || scores.slice(0, 1);

    const recentAvg =
      recentScores.reduce((sum, s) => sum + s.overall, 0) / recentScores.length;
    const olderAvg =
      olderScores.length > 0
        ? olderScores.reduce((sum, s) => sum + s.overall, 0) / olderScores.length
        : recentAvg;

    const percentageChange = recentAvg - olderAvg;
    let trend: 'improving' | 'stable' | 'declining' = 'stable';

    if (percentageChange > 5) {
      trend = 'improving';
    } else if (percentageChange < -5) {
      trend = 'declining';
    }

    return {
      trend,
      percentageChange: Math.round(percentageChange * 10) / 10,
      lastWeekAverage: Math.round(recentAvg),
    };
  }

  /**
   * Get detailed score report
   */
  getDetailedReport(
    findings: UnifiedFinding[],
  ): {
    scores: SecurityScore;
    grade: string;
    summary: string;
    recommendations: string[];
  } {
    const scores = this.calculateSecurityScores(findings);
    const grade = this.getSecurityGrade(scores.overall);

    const recommendations: string[] = [];

    // Generate recommendations based on low scores
    if (scores.authentication < 80) {
      recommendations.push(
        'Strengthen authentication mechanisms - Address JWT, session, and credential handling issues',
      );
    }
    if (scores.secretSecurity < 80) {
      recommendations.push(
        'Prevent secret exposure - Implement secret scanning in CI/CD and remove hardcoded credentials',
      );
    }
    if (scores.dependencySecurity < 80) {
      recommendations.push(
        'Update dependencies - Address vulnerable third-party packages and libraries',
      );
    }
    if (scores.apiSecurity < 80) {
      recommendations.push(
        'Enhance API security - Implement rate limiting, input validation, and authentication',
      );
    }
    if (scores.headerSecurity < 80) {
      recommendations.push(
        'Configure security headers - Add CSP, HSTS, X-Frame-Options, etc.',
      );
    }
    if (scores.infrastructureSecurity < 80) {
      recommendations.push(
        'Harden infrastructure - Review Docker, Kubernetes, and CI/CD configurations',
      );
    }

    const summary = this.generateSummary(grade, scores);

    return { scores, grade, summary, recommendations };
  }

  /**
   * Generate summary text
   */
  private generateSummary(grade: string, scores: SecurityScore): string {
    const gradeLevelMap = {
      'A': 'Excellent',
      'B': 'Good',
      'C': 'Fair',
      'D': 'Poor',
      'F': 'Critical',
    };

    const level = gradeLevelMap[grade];
    const weakestArea = Object.entries(scores)
      .filter(([key]) => key !== 'overall' && key !== 'timestamp')
      .sort(([, a], [, b]) => a - b)[0];

    return `Security posture is ${level} (Grade ${grade}, Score ${scores.overall}/100). ` +
           `Weakest area: ${weakestArea[0].replace(/([A-Z])/g, ' $1').toLowerCase()} (${weakestArea[1]}/100). ` +
           `Focus on addressing critical and high-severity findings to improve overall security.`;
  }

  /**
   * Compare scores over time
   */
  compareScores(
    previous: SecurityScore,
    current: SecurityScore,
  ): {
    overallChange: number;
    improvedAreas: string[];
    declinedAreas: string[];
  } {
    const changes: Record<string, number> = {};
    const improvedAreas: string[] = [];
    const declinedAreas: string[] = [];

    Object.keys(previous).forEach((key) => {
      if (key === 'timestamp') return;

      const prevScore = previous[key] as number;
      const currScore = current[key] as number;
      const change = currScore - prevScore;

      changes[key] = change;

      if (change > 5) {
        improvedAreas.push(`${key}: +${change}`);
      } else if (change < -5) {
        declinedAreas.push(`${key}: ${change}`);
      }
    });

    return {
      overallChange: (current.overall - previous.overall),
      improvedAreas,
      declinedAreas,
    };
  }
}
