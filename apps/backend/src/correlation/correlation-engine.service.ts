// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { UnifiedFinding, FindingStatus } from '@securelens/findings-schema';

/**
 * Correlation Engine
 * 
 * Identifies and merges related findings to reduce duplicate alerts
 * and provide a cleaner, more actionable security report.
 */

interface FindingGroup {
  representative: UnifiedFinding;
  findings: UnifiedFinding[];
  confidence: number;
}

@Injectable()
export class CorrelationEngineService {
  private readonly logger = new Logger(CorrelationEngineService.name);

  /**
   * Correlate findings to remove duplicates and group related issues
   */
  correlateFindings(findings: UnifiedFinding[]): {
    dedupedFindings: UnifiedFinding[];
    duplicateMap: Map<string, string[]>;
    correlationGroups: FindingGroup[];
  } {
    this.logger.log(`Starting correlation for ${findings.length} findings`);

    const duplicateMap = new Map<string, string[]>();
    const correlationGroups: FindingGroup[] = [];
    const processed = new Set<string>();
    const dedupedFindings: UnifiedFinding[] = [];

    // Sort findings for consistent processing
    const sorted = [...findings].sort((a, b) => {
      const severityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      return (
        severityOrder[a.severity] - severityOrder[b.severity] ||
        (b.firstSeen?.getTime() || 0) - (a.firstSeen?.getTime() || 0)
      );
    });

    // First pass: Find exact and near-duplicates
    for (let i = 0; i < sorted.length; i++) {
      const finding = sorted[i];
      const findingId = finding.id || `finding_${i}`;

      if (processed.has(findingId)) {
        continue;
      }

      const duplicates: string[] = [];
      const group: UnifiedFinding[] = [finding];

      // Search for duplicates
      for (let j = i + 1; j < sorted.length; j++) {
        const other = sorted[j];
        const otherId = other.id || `finding_${j}`;

        if (processed.has(otherId)) {
          continue;
        }

        const similarityResult = this.calculateSimilarity(finding, other);

        if (similarityResult.score >= 0.85) {
          // Near duplicate or exact match
          duplicates.push(otherId);
          group.push(other);
          processed.add(otherId);

          // Mark finding as duplicate
          other.isDuplicate = true;
          other.parentFindingId = findingId;
          other.status = FindingStatus.DUPLICATE;
        }
      }

      processed.add(findingId);

      if (duplicates.length > 0) {
        duplicateMap.set(findingId, duplicates);
        
        // Create merged finding
        const merged = this.mergeFindingGroup(finding, group);
        correlationGroups.push({
          representative: merged,
          findings: group,
          confidence: similarityResult?.score || 1.0,
        });
        dedupedFindings.push(merged);
      } else {
        dedupedFindings.push(finding);
      }
    }

    // Second pass: Find related findings across engines
    const relatedGroups = this.findRelatedFindings(dedupedFindings);

    this.logger.log(
      `Correlation complete: ${dedupedFindings.length} deduped findings, ` +
      `${correlationGroups.length} correlation groups, ` +
      `${relatedGroups.length} related groups`,
    );

    return {
      dedupedFindings,
      duplicateMap,
      correlationGroups,
    };
  }

  /**
   * Calculate similarity score between two findings
   */
  private calculateSimilarity(
    finding1: UnifiedFinding,
    finding2: UnifiedFinding,
  ) {
    let score = 0;
    let factors = 0;

    // Title similarity (weighted: 30%)
    if (this.stringSimilarity(finding1.title, finding2.title) > 0.8) {
      score += 0.3;
    }
    factors += 0.3;

    // Category match (weighted: 20%)
    if (finding1.category === finding2.category) {
      score += 0.2;
    }
    factors += 0.2;

    // Target match (weighted: 20%)
    if (finding1.targetUrl && finding2.targetUrl) {
      if (this.stringSimilarity(finding1.targetUrl, finding2.targetUrl) > 0.9) {
        score += 0.2;
      }
    }
    factors += 0.2;

    // CVE match (weighted: 15%)
    if (finding1.cve && finding2.cve && finding1.cve === finding2.cve) {
      score += 0.15;
    }
    factors += 0.15;

    // CWE match (weighted: 15%)
    if (finding1.cwe && finding2.cwe && finding1.cwe === finding2.cwe) {
      score += 0.15;
    }
    factors += 0.15;

    return {
      score: factors > 0 ? score / factors : 0,
      details: {
        titleSimilarity: this.stringSimilarity(finding1.title, finding2.title),
        categoryMatch: finding1.category === finding2.category,
        targetMatch: finding1.targetUrl === finding2.targetUrl,
        cveMatch: finding1.cve === finding2.cve,
        cweMatch: finding1.cwe === finding2.cwe,
      },
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1?.toLowerCase() || '';
    const s2 = str2?.toLowerCase() || '';

    if (s1 === s2) return 1.0;

    const len1 = s1.length;
    const len2 = s2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(s1, s2);
    return 1.0 - distance / maxLen;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator,
        );
      }
    }

    return track[str2.length][str1.length];
  }

  /**
   * Merge findings in a group
   */
  private mergeFindingGroup(
    primary: UnifiedFinding,
    group: UnifiedFinding[],
  ): UnifiedFinding {
    const merged: UnifiedFinding = {
      ...primary,
      correlatedFindingIds: group
        .filter((f) => f.id !== primary.id)
        .map((f) => f.id)
        .filter(Boolean),
      evidence: this.mergeEvidence(group.map((f) => f.evidence).filter(Boolean) as string[]),
      references: [...new Set(group.flatMap((f) => f.references || []))],
      firstSeen: new Date(
        Math.min(...group.map((f) => f.firstSeen?.getTime() || 0)),
      ),
      lastSeen: new Date(
        Math.max(...group.map((f) => f.lastSeen?.getTime() || 0)),
      ),
      updatedAt: new Date(),
    };

    return merged;
  }

  /**
   * Merge evidence from multiple findings
   */
  private mergeEvidence(evidence: string[]): string {
    if (evidence.length === 0) return '';
    if (evidence.length === 1) return evidence[0];
    return evidence.join('\n---\n');
  }

  /**
   * Find related findings across different engines/categories
   */
  private findRelatedFindings(findings: UnifiedFinding[]): FindingGroup[] {
    const groups: FindingGroup[] = [];
    const processed = new Set<string>();

    // Known related finding patterns
    const relationPatterns = [
      // Missing security headers
      ['headers', 'ssl_tls', 'configuration'],
      // Authentication issues
      ['authentication', 'cookies', 'headers'],
      // API security
      ['api_security', 'injection', 'authentication'],
      // Secret exposure
      ['secrets', 'code_quality', 'infrastructure'],
    ];

    for (const pattern of relationPatterns) {
      const matchingFindings = findings.filter(
        (f) =>
          !processed.has(f.id || '') && pattern.includes(f.category),
      );

      if (matchingFindings.length > 1) {
        const representative = matchingFindings[0];
        const group: FindingGroup = {
          representative,
          findings: matchingFindings,
          confidence: 0.7,
        };
        groups.push(group);

        matchingFindings.forEach((f) => {
          processed.add(f.id || '');
          if (!representative.correlatedFindingIds) {
            representative.correlatedFindingIds = [];
          }
          if (f.id !== representative.id) {
            representative.correlatedFindingIds.push(f.id);
          }
        });
      }
    }

    return groups;
  }

  /**
   * Get correlation statistics
   */
  getCorrelationStats(findings: UnifiedFinding[]) {
    let duplicateCount = 0;
    let correlatedCount = 0;

    findings.forEach((f) => {
      if (f.isDuplicate) duplicateCount++;
      if (f.correlatedFindingIds && f.correlatedFindingIds.length > 0) {
        correlatedCount++;
      }
    });

    return {
      totalFindings: findings.length,
      duplicates: duplicateCount,
      correlated: correlatedCount,
      unique: findings.length - duplicateCount,
      reductionPercentage: (
        ((duplicateCount) / Math.max(findings.length, 1)) * 100
      ).toFixed(2),
    };
  }
}
