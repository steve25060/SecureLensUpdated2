/**
 * Unified Findings Schema
 * 
 * This defines the standard format for all security findings
 * across all security engines, regardless of their original output format.
 * 
 * Every scanner output is parsed into this normalized schema.
 */

export enum FindingSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum FindingStatus {
  NEW = 'new',
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  DUPLICATE = 'duplicate',
}

export enum FindingCategory {
  AUTHENTICATION = 'authentication',
  API_SECURITY = 'api_security',
  HEADERS = 'headers',
  COOKIES = 'cookies',
  SSL_TLS = 'ssl_tls',
  SECRETS = 'secrets',
  DEPENDENCIES = 'dependencies',
  CODE_QUALITY = 'code_quality',
  INFRASTRUCTURE = 'infrastructure',
  CONFIGURATION = 'configuration',
  INJECTION = 'injection',
  XSS = 'xss',
  CSRF = 'csrf',
  MISCONFIGURATION = 'misconfiguration',
  EXPOSURE = 'exposure',
}

/**
 * Core Finding Interface
 */
export interface UnifiedFinding {
  // Unique Identifiers
  id?: string;
  scanId: string;
  workspaceId: string;
  
  // Finding Details
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  category: FindingCategory;
  
  // Source Information
  source: string; // e.g., "nuclei", "owasp_zap", "semgrep"
  sourceId?: string; // Original ID from the scanner
  engine: string; // Internal engine ID (not tool name)
  
  // Target Information
  targetHost?: string;
  targetUrl?: string;
  targetPath?: string;
  targetPort?: number;
  parameter?: string;
  
  // Evidence & Details
  evidence?: string;
  reproductionSteps?: string[];
  requestExample?: string;
  responseExample?: string;
  
  // Remediation
  remediation?: string;
  remediationEffort?: 'low' | 'medium' | 'high';
  
  // Standards & References
  cwe?: string; // CWE ID
  cvss?: number; // CVSS Score
  cvssVector?: string; // CVSS Vector
  cve?: string; // CVE ID
  owasp?: string; // OWASP Top 10 / API
  capec?: string; // CAPEC ID
  
  // Additional Information
  references?: string[];
  tags?: string[];
  affectedComponent?: string;
  affectedVersion?: string;
  
  // AI Assistance
  aiExplanation?: string;
  aiRemediationSuggestion?: string;
  
  // Timestamps
  firstSeen: Date;
  lastSeen: Date;
  resolvedAt?: Date;
  
  // Correlation
  correlatedFindingIds?: string[];
  isDuplicate?: boolean;
  parentFindingId?: string;
  
  // Risk Assessment
  riskScore?: number; // 0-100
  businessImpact?: string;
  exploitability?: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Result Parser Input Interface
 * This is what scanners return before normalization
 */
export interface RawScannerResult {
  engine: string; // Internal engine ID
  target: string;
  timestamp: Date;
  findings: any[];
  metadata?: Record<string, any>;
  errors?: string[];
}

/**
 * Parser Interface
 */
export interface IScannerParser {
  parse(rawResult: RawScannerResult): UnifiedFinding[];
  canHandle(engine: string): boolean;
}

/**
 * Finding Batch Interface
 */
export interface FindingBatch {
  scanId: string;
  findings: UnifiedFinding[];
  totalCount: number;
  timestamp: Date;
}

/**
 * Correlation Result
 */
export interface CorrelationResult {
  originalFindings: UnifiedFinding[];
  correlatedFindings: UnifiedFinding[];
  removedDuplicates: string[];
  mergedGroups: Map<string, UnifiedFinding[]>;
}

/**
 * Finding Statistics
 */
export interface FindingStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byCategory: Record<FindingCategory, number>;
  byEngine: Record<string, number>;
  resolved: number;
  duplicates: number;
  falsePositives: number;
}

/**
 * Helper function to create a unified finding
 */
export function createUnifiedFinding(
  overrides: Partial<UnifiedFinding>,
): UnifiedFinding {
  const now = new Date();
  return {
    title: '',
    description: '',
    severity: FindingSeverity.MEDIUM,
    status: FindingStatus.NEW,
    category: FindingCategory.MISCONFIGURATION,
    source: '',
    engine: '',
    scanId: '',
    workspaceId: '',
    firstSeen: now,
    lastSeen: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Helper function to validate a finding
 */
export function isValidFinding(finding: any): finding is UnifiedFinding {
  return (
    finding.title &&
    finding.description &&
    finding.severity &&
    finding.status &&
    finding.category &&
    finding.source &&
    finding.engine &&
    finding.scanId &&
    finding.workspaceId &&
    finding.firstSeen &&
    finding.lastSeen &&
    finding.createdAt &&
    finding.updatedAt
  );
}

export default {
  FindingSeverity,
  FindingStatus,
  FindingCategory,
  createUnifiedFinding,
  isValidFinding,
};
