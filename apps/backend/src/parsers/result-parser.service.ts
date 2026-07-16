import {
  UnifiedFinding,
  FindingSeverity,
  FindingStatus,
  FindingCategory,
  createUnifiedFinding,
  IScannerParser,
  RawScannerResult,
} from '@securelens/findings-schema';
import { SCANNER_ENGINES } from '@securelens/constants';

/**
 * Result Parser Service
 * Converts scanner-specific output into unified findings
 */

// Nuclei Parser
export class NucleiParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.VULNERABILITY_SCAN;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.info?.name || 'Unknown Vulnerability',
          description: finding.info?.description || '',
          severity: this.mapSeverity(finding.info?.severity),
          category: FindingCategory.MISCONFIGURATION,
          source: 'nuclei',
          engine: SCANNER_ENGINES.VULNERABILITY_SCAN,
          targetUrl: finding.matched_at || rawResult.target,
          remediation: finding.info?.remediation,
          cve: finding.info?.cve,
          cvss: finding.info?.cvss_score,
          owasp: finding.info?.owasp_category,
          references: finding.info?.reference ? [finding.info.reference] : [],
          evidence: finding.extracted || finding.curl_command,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing Nuclei finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(nucleiSeverity: string): FindingSeverity {
    const mapping = {
      critical: FindingSeverity.CRITICAL,
      high: FindingSeverity.HIGH,
      medium: FindingSeverity.MEDIUM,
      low: FindingSeverity.LOW,
      info: FindingSeverity.INFO,
      unknown: FindingSeverity.INFO,
    };
    return mapping[nucleiSeverity?.toLowerCase()] || FindingSeverity.MEDIUM;
  }
}

// OWASP ZAP Parser
export class ZAPParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.RUNTIME_SECURITY ||
           engine === SCANNER_ENGINES.API_SECURITY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.name || 'Security Issue',
          description: finding.description || '',
          severity: this.mapSeverity(finding.riskcode),
          category: this.mapCategory(finding.pluginid),
          source: 'owasp_zap',
          engine: this.selectEngine(finding),
          targetUrl: finding.uri || rawResult.target,
          remediation: finding.solution,
          cwe: finding.cwe,
          cvss: finding.cvssScore,
          owasp: finding.owasp,
          evidence: finding.evidence,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing ZAP finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(riskCode: number): FindingSeverity {
    const mapping = {
      3: FindingSeverity.HIGH,
      2: FindingSeverity.MEDIUM,
      1: FindingSeverity.LOW,
      0: FindingSeverity.INFO,
    };
    return mapping[riskCode] || FindingSeverity.MEDIUM;
  }

  private mapCategory(pluginId: number): FindingCategory {
    // Simplified mapping
    const categoryMap = {
      10000: FindingCategory.HEADERS,
      10002: FindingCategory.COOKIES,
      10006: FindingCategory.XSS,
      90005: FindingCategory.AUTHENTICATION,
    };
    return categoryMap[pluginId] || FindingCategory.MISCONFIGURATION;
  }

  private selectEngine(finding: any): string {
    if (finding.uri?.includes('api')) {
      return SCANNER_ENGINES.API_SECURITY;
    }
    return SCANNER_ENGINES.RUNTIME_SECURITY;
  }
}

// Semgrep Parser
export class SemgrepParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.CODE_SECURITY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.message || 'Code Issue',
          description: finding.extra?.message || '',
          severity: this.mapSeverity(finding.extra?.severity),
          category: FindingCategory.CODE_QUALITY,
          source: 'semgrep',
          engine: SCANNER_ENGINES.CODE_SECURITY,
          targetUrl: rawResult.target,
          targetPath: finding.path,
          parameter: `${finding.start?.line}:${finding.start?.col}`,
          remediation: finding.extra?.fix_markdown,
          cwe: finding.extra?.cwe,
          references: finding.extra?.references || [],
          evidence: finding.extra?.code,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing Semgrep finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(severity: string): FindingSeverity {
    const mapping = {
      CRITICAL: FindingSeverity.CRITICAL,
      HIGH: FindingSeverity.HIGH,
      MEDIUM: FindingSeverity.MEDIUM,
      LOW: FindingSeverity.LOW,
      INFO: FindingSeverity.INFO,
    };
    return mapping[severity?.toUpperCase()] || FindingSeverity.MEDIUM;
  }
}

// Gitleaks Parser
export class GitleaksParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.SECRET_DETECTION;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: `${finding.RuleTitle || 'Secret'} Detected in Repository`,
          description: `A ${finding.RuleTitle || 'potential secret'} was detected in the Git history. This could be an exposed API key, token, or other sensitive credential.`,
          severity: FindingSeverity.CRITICAL,
          category: FindingCategory.SECRETS,
          source: 'gitleaks',
          engine: SCANNER_ENGINES.SECRET_DETECTION,
          targetUrl: rawResult.target,
          targetPath: finding.File,
          parameter: `Line ${finding.Line}, Column ${finding.Column}`,
          evidence: `Match: ${finding.Match?.substring(0, 50)}${finding.Match?.length > 50 ? '...' : ''}`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            commit: finding.Commit,
            author: finding.Author,
            email: finding.Email,
            commitDate: finding.CommitDate,
            message: finding.Message,
            entropy: finding.Entropy,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing Gitleaks finding:', error);
      }
    }

    return findings;
  }
}

// Trivy Parser
export class TrivyParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.DEPENDENCY_ANALYSIS;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.VulnerabilityID,
          description: finding.Description || '',
          severity: this.mapSeverity(finding.Severity),
          category: FindingCategory.DEPENDENCIES,
          source: 'trivy',
          engine: SCANNER_ENGINES.DEPENDENCY_ANALYSIS,
          targetUrl: rawResult.target,
          affectedComponent: finding.PkgName,
          affectedVersion: finding.InstalledVersion,
          cve: finding.VulnerabilityID,
          cvss: finding.CVSS?.nvd?.V3Score,
          references: finding.References || [],
          remediation: finding.FixedVersion ? `Upgrade to ${finding.FixedVersion}` : undefined,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing Trivy finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(severity: string): FindingSeverity {
    const mapping = {
      CRITICAL: FindingSeverity.CRITICAL,
      HIGH: FindingSeverity.HIGH,
      MEDIUM: FindingSeverity.MEDIUM,
      LOW: FindingSeverity.LOW,
      UNKNOWN: FindingSeverity.INFO,
    };
    return mapping[severity?.toUpperCase()] || FindingSeverity.MEDIUM;
  }
}

// DNSX Parser
export class DnsxParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.ASSET_DISCOVERY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const discovery of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: `DNS Record: ${discovery.host}`,
          description: `Resolved to IP(s): ${discovery.ips?.join(', ') || 'N/A'}`,
          severity: FindingSeverity.INFO,
          category: FindingCategory.CONFIGURATION,
          source: 'dnsx',
          engine: SCANNER_ENGINES.ASSET_DISCOVERY,
          targetUrl: rawResult.target,
          evidence: `${discovery.host} => ${discovery.ips?.join(', ') || 'N/A'}`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            host: discovery.host,
            ips: discovery.ips,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing DNSX discovery:', error);
      }
    }

    return findings;
  }
}

// HTTPX Parser
export class HttpxParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.ASSET_DISCOVERY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const probe of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: `HTTP Probe: ${probe.url}`,
          description: `Status: ${probe.status}, Title: ${probe.title || 'N/A'}`,
          severity: FindingSeverity.INFO,
          category: FindingCategory.CONFIGURATION,
          source: 'httpx',
          engine: SCANNER_ENGINES.ASSET_DISCOVERY,
          targetUrl: probe.url,
          evidence: `${probe.url} (${probe.status}) - ${probe.title || 'No title'}`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            url: probe.url,
            status: probe.status,
            title: probe.title,
            server: probe.server,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing HTTPX probe:', error);
      }
    }

    return findings;
  }
}

// Nmap Parser
export class NmapParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.ASSET_DISCOVERY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const port of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: `Open Port: ${port.port}/${port.protocol || 'tcp'}`,
          description: `Service: ${port.service || 'unknown'}, Version: ${port.version || 'unknown'}`,
          severity: FindingSeverity.LOW,
          category: FindingCategory.CONFIGURATION,
          source: 'nmap',
          engine: SCANNER_ENGINES.ASSET_DISCOVERY,
          targetUrl: rawResult.target,
          parameter: `${port.port}/${port.protocol}`,
          evidence: `${port.port}/${port.protocol} - ${port.service || 'unknown'}`,
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            port: port.port,
            protocol: port.protocol,
            service: port.service,
            version: port.version,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing Nmap port:', error);
      }
    }

    return findings;
  }
}

// testssl.sh Parser
export class TestsslParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.SSL_TLS_ANALYSIS;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.title || finding.test || 'SSL/TLS Issue',
          description: finding.description || finding.finding || '',
          severity: this.mapSeverity(finding.severity),
          category: FindingCategory.SSL_TLS,
          source: 'testssl',
          engine: SCANNER_ENGINES.SSL_TLS_ANALYSIS,
          targetUrl: rawResult.target,
          remediation: finding.remediation || 'Update SSL/TLS configuration',
          evidence: finding.details || '',
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            severity: finding.severity,
            cve: finding.cve,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing testssl finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(severity?: string): FindingSeverity {
    const mapping: { [key: string]: FindingSeverity } = {
      CRITICAL: FindingSeverity.CRITICAL,
      HIGH: FindingSeverity.HIGH,
      MEDIUM: FindingSeverity.MEDIUM,
      LOW: FindingSeverity.LOW,
      INFO: FindingSeverity.INFO,
    };
    return mapping[severity?.toUpperCase() || 'MEDIUM'] || FindingSeverity.MEDIUM;
  }
}

// OWASP ZAP Parser
export class ZAPParserEnhanced implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.RUNTIME_SECURITY ||
           engine === SCANNER_ENGINES.API_SECURITY;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const finding of rawResult.findings) {
      try {
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: finding.name || finding.alert || 'Security Issue',
          description: finding.description || finding.alertdesc || '',
          severity: this.mapSeverity(finding.riskcode || finding.risk),
          category: this.mapCategory(finding.pluginid || finding.pluginName),
          source: 'owasp_zap',
          engine: this.selectEngine(finding),
          targetUrl: finding.url || finding.uri || rawResult.target,
          remediation: finding.solution || finding.otherinfo,
          parameter: finding.param,
          cwe: finding.cwe,
          owasp: finding.owasp,
          evidence: finding.evidence || finding.desc,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing ZAP finding:', error);
      }
    }

    return findings;
  }

  private mapSeverity(riskCode: number | string): FindingSeverity {
    const code = typeof riskCode === 'string' ? parseInt(riskCode) : riskCode;
    const mapping = {
      3: FindingSeverity.HIGH,
      2: FindingSeverity.MEDIUM,
      1: FindingSeverity.LOW,
      0: FindingSeverity.INFO,
    };
    return mapping[code] || FindingSeverity.MEDIUM;
  }

  private mapCategory(pluginId: number | string): FindingCategory {
    const categoryMap: { [key: number]: FindingCategory } = {
      10000: FindingCategory.HEADERS,
      10002: FindingCategory.COOKIES,
      10006: FindingCategory.AUTHENTICATION,
      90005: FindingCategory.AUTHENTICATION,
    };
    const id = typeof pluginId === 'string' ? parseInt(pluginId) : pluginId;
    return categoryMap[id] || FindingCategory.MISCONFIGURATION;
  }

  private selectEngine(finding: any): string {
    if (finding.url?.includes('api')) {
      return SCANNER_ENGINES.API_SECURITY;
    }
    return SCANNER_ENGINES.RUNTIME_SECURITY;
  }
}

// WhatWeb Parser
export class WhatwebParser implements IScannerParser {
  canHandle(engine: string): boolean {
    return engine === SCANNER_ENGINES.TECH_DETECTION;
  }

  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const findings: UnifiedFinding[] = [];

    if (!rawResult.findings || !Array.isArray(rawResult.findings)) {
      return findings;
    }

    for (const tech of rawResult.findings) {
      try {
        const version = tech.version || 'unknown';
        const unified = createUnifiedFinding({
          scanId: rawResult.target,
          title: `Technology Detected: ${tech.name}`,
          description: `${tech.name} ${version} detected on ${rawResult.target}`,
          severity: FindingSeverity.INFO,
          category: FindingCategory.CONFIGURATION,
          source: 'whatweb',
          engine: SCANNER_ENGINES.TECH_DETECTION,
          targetUrl: rawResult.target,
          evidence: `${tech.name} (version: ${version})`,
          references: tech.website ? [tech.website] : [],
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {
            version,
            icon: tech.icon,
            website: tech.website,
            headers: tech.headers,
          },
        });

        findings.push(unified);
      } catch (error) {
        console.error('Error parsing WhatWeb technology:', error);
      }
    }

    return findings;
  }
}

/**
 * Master Parser Service
 */
export class ResultParserService {
  private parsers: Map<string, IScannerParser> = new Map();

  constructor() {
    this.registerParsers();
  }

  private registerParsers() {
    const nucleiParser = new NucleiParser();
    const zapParser = new ZAPParser();
    const zapParserEnhanced = new ZAPParserEnhanced();
    const semgrepParser = new SemgrepParser();
    const gitleaksParser = new GitleaksParser();
    const trivyParser = new TrivyParser();
    const whatwebParser = new WhatwebParser();
    const dnsxParser = new DnsxParser();
    const httpxParser = new HttpxParser();
    const nmapParser = new NmapParser();
    const testsslParser = new TestsslParser();

    // Register parsers for all engines they can handle
    Object.values(SCANNER_ENGINES).forEach((engine) => {
      if (nucleiParser.canHandle(engine)) this.parsers.set(engine, nucleiParser);
      if (zapParser.canHandle(engine)) this.parsers.set(engine, zapParser);
      if (zapParserEnhanced.canHandle(engine)) this.parsers.set(engine, zapParserEnhanced);
      if (semgrepParser.canHandle(engine)) this.parsers.set(engine, semgrepParser);
      if (gitleaksParser.canHandle(engine)) this.parsers.set(engine, gitleaksParser);
      if (trivyParser.canHandle(engine)) this.parsers.set(engine, trivyParser);
      if (whatwebParser.canHandle(engine)) this.parsers.set(engine, whatwebParser);
      if (dnsxParser.canHandle(engine)) this.parsers.set(engine, dnsxParser);
      if (httpxParser.canHandle(engine)) this.parsers.set(engine, httpxParser);
      if (nmapParser.canHandle(engine)) this.parsers.set(engine, nmapParser);
      if (testsslParser.canHandle(engine)) this.parsers.set(engine, testsslParser);
    });
  }

  /**
   * Parse raw scanner results into unified findings
   */
  parse(rawResult: RawScannerResult): UnifiedFinding[] {
    const parser = this.parsers.get(rawResult.engine);

    if (!parser) {
      console.warn(`No parser found for engine: ${rawResult.engine}`);
      return [];
    }

    return parser.parse(rawResult);
  }

  /**
   * Parse multiple results
   */
  parseMultiple(rawResults: RawScannerResult[]): UnifiedFinding[] {
    return rawResults.flatMap((result) => this.parse(result));
  }
}

export default {
  NucleiParser,
  ZAPParser,
  ZAPParserEnhanced,
  SemgrepParser,
  GitleaksParser,
  TrivyParser,
  WhatwebParser,
  DnsxParser,
  HttpxParser,
  NmapParser,
  TestsslParser,
  ResultParserService,
};
