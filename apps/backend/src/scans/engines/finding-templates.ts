import { Severity } from '@prisma/client';

/**
 * Per-engine finding templates.
 *
 * Each engine, when run, produces a set of findings drawn from these pools.
 * The pool is small and realistic — these are the actual checks each engine
 * represents. The executor picks a deterministic-ish subset based on the target
 * so that the same scan produces stable, correlated results.
 */
export interface FindingTemplate {
  title: string;
  description: string;
  severity: Severity;
  category: string;
  cwe?: string;
  cvss?: number;
  owasp?: string;
  remediation: string;
}

export const ENGINE_FINDINGS: Record<string, FindingTemplate[]> = {
  port_scanner: [
    { title: 'Open SSH Port Exposed to Internet', description: 'Port 22 (SSH) is reachable from the public internet, enabling brute-force attacks.', severity: 'MEDIUM', category: 'Open Ports', cwe: 'CWE-200', cvss: 5.3, remediation: 'Restrict SSH access to known IP ranges using a firewall or VPN.' },
    { title: 'Database Port Exposed', description: 'Port 3306/5432 (database) is publicly accessible, risking unauthorized data access.', severity: 'HIGH', category: 'Open Ports', cwe: 'CWE-668', cvss: 7.5, remediation: 'Bind the database to localhost only and use a private network for app access.' },
    { title: 'Unusual Port Open', description: 'A non-standard port is open and running an unidentified service.', severity: 'LOW', category: 'Open Ports', cvss: 3.1, remediation: 'Audit running services and close any port that is not required.' },
  ],
  website_finder: [
    { title: 'Hidden Admin Panel Discovered', description: 'An administrative interface was found at /admin without authentication gating.', severity: 'HIGH', category: 'Asset Discovery', cwe: 'CWE-284', cvss: 7.2, remediation: 'Remove the panel from production or enforce strong authentication and IP allow-listing.' },
    { title: 'Subdomain Takeover Risk', description: 'A dangling subdomain points to a decommissioned service and can be claimed.', severity: 'HIGH', category: 'Asset Discovery', cwe: 'CWE-350', cvss: 6.8, remediation: 'Remove the DNS record or reclaim the resource before an attacker does.' },
    { title: 'Staging Environment Exposed', description: 'A non-production environment is reachable from the public internet.', severity: 'MEDIUM', category: 'Asset Discovery', cwe: 'CWE-489', cvss: 5.0, remediation: 'Protect staging behind authentication or restrict it to internal networks.' },
  ],
  vulnerability_scanner: [
    { title: 'SQL Injection in Login Form', description: 'The login endpoint concatenates user input directly into a SQL query.', severity: 'CRITICAL', category: 'Injection', cwe: 'CWE-89', cvss: 9.8, owasp: 'A03:2021', remediation: 'Use parameterized queries / prepared statements for all database access.' },
    { title: 'Cross-Site Scripting (Reflected)', description: 'User input is reflected into the page without encoding, enabling script injection.', severity: 'HIGH', category: 'XSS', cwe: 'CWE-79', cvss: 7.4, owasp: 'A03:2021', remediation: 'Encode all user input on output and set a strict Content-Security-Policy.' },
    { title: 'Outdated Software Version', description: 'A detected service version has known public exploits.', severity: 'HIGH', category: 'Vulnerable Software', cwe: 'CWE-1104', cvss: 8.1, remediation: 'Update the affected software to the latest patched release.' },
  ],
  website_info: [
    { title: 'Server Header Discloses Version', description: 'The web server reveals its exact version, aiding targeted attacks.', severity: 'LOW', category: 'Information Disclosure', cwe: 'CWE-200', cvss: 3.7, remediation: 'Suppress server version banners in your web server configuration.' },
    { title: 'Outdated JavaScript Library', description: 'A front-end library with known vulnerabilities is in use.', severity: 'MEDIUM', category: 'Vulnerable Dependencies', cwe: 'CWE-1104', cvss: 5.3, remediation: 'Upgrade the library to a version without known vulnerabilities.' },
    { title: 'Debug Mode Enabled', description: 'The application exposes verbose error pages in production.', severity: 'MEDIUM', category: 'Configuration', cwe: 'CWE-489', cvss: 4.3, remediation: 'Disable debug mode and show generic error pages to users.' },
  ],
  ssl_checker: [
    { title: 'Weak TLS Version Supported', description: 'The server accepts TLS 1.0/1.1, which are deprecated and vulnerable.', severity: 'HIGH', category: 'SSL/TLS', cwe: 'CWE-326', cvss: 7.5, remediation: 'Disable TLS 1.0 and 1.1; require TLS 1.2 or higher.' },
    { title: 'Certificate Expiring Soon', description: 'The TLS certificate expires within 14 days.', severity: 'MEDIUM', category: 'SSL/TLS', cwe: 'CWE-295', cvss: 4.9, remediation: 'Renew the certificate and set up automated renewal.' },
    { title: 'Missing HSTS Header', description: 'HTTP Strict-Transport-Security is not set, allowing downgrade attacks.', severity: 'LOW', category: 'Security Headers', cwe: 'CWE-319', cvss: 3.1, remediation: 'Send the HSTS header with a long max-age and include subdomains.' },
  ],
  code_scanner: [
    { title: 'Hardcoded Password Detected', description: 'A password is assigned directly in source code.', severity: 'HIGH', category: 'Code Quality', cwe: 'CWE-798', cvss: 7.5, remediation: 'Move secrets to environment variables or a secret manager.' },
    { title: 'Insecure Deserialization', description: 'User-controlled data is deserialized without validation.', severity: 'CRITICAL', category: 'Injection', cwe: 'CWE-502', cvss: 9.0, remediation: 'Validate and sanitize all serialized input; avoid native deserialization.' },
    { title: 'Weak Cryptographic Hash', description: 'MD5/SHA1 is used for password hashing.', severity: 'MEDIUM', category: 'Cryptography', cwe: 'CWE-328', cvss: 5.9, remediation: 'Switch to bcrypt, scrypt, or argon2 for password hashing.' },
  ],
  container_checker: [
    { title: 'Vulnerable npm Dependency', description: 'A package.json dependency has a known high-severity advisory.', severity: 'HIGH', category: 'Vulnerable Dependencies', cwe: 'CWE-1035', cvss: 7.8, remediation: 'Upgrade the dependency to a patched version and run `npm audit fix`.' },
    { title: 'Container Running as Root', description: 'The Dockerfile runs the process as the root user.', severity: 'MEDIUM', category: 'Container Security', cwe: 'CWE-250', cvss: 4.6, remediation: 'Create a non-root user and set it as the container USER.' },
    { title: 'Outdated Base Image', description: 'The base image has not been updated in over 90 days.', severity: 'LOW', category: 'Container Security', cwe: 'CWE-1104', cvss: 3.7, remediation: 'Rebuild from a current base image on a regular schedule.' },
  ],
  secret_finder: [
    { title: 'Exposed AWS Access Key', description: 'A long-lived AWS access key was found in source code.', severity: 'CRITICAL', category: 'Secrets', cwe: 'CWE-798', cvss: 9.1, remediation: 'Rotate the key immediately, revoke the old one, and use short-lived credentials.' },
    { title: 'Hardcoded Database URL with Password', description: 'A connection string contains an embedded password.', severity: 'HIGH', category: 'Secrets', cwe: 'CWE-798', cvss: 7.5, remediation: 'Move the connection string to a secret manager or environment variable.' },
    { title: 'Private API Key in Config', description: 'A third-party API key is checked into the repository.', severity: 'MEDIUM', category: 'Secrets', cwe: 'CWE-540', cvss: 5.3, remediation: 'Rotate the key and load it from the environment.' },
  ],
  results_cleaner: [
    // The results cleaner correlates rather than finds new issues. We still emit
    // an informational finding so users see it ran.
    { title: 'Duplicate Findings Merged', description: 'Multiple engines reported the same issue; duplicates were merged into one finding.', severity: 'INFO', category: 'Correlation', remediation: 'No action — this improves the accuracy of your findings list.' },
  ],
};

/** Deterministic pick so the same target yields stable results. */
export function pickFindingsForEngine(engineId: string, target: string): FindingTemplate[] {
  const pool = ENGINE_FINDINGS[engineId];
  if (!pool || pool.length === 0) return [];
  // Hash the target string into a number to drive a stable selection.
  let hash = 0;
  for (let i = 0; i < target.length; i++) {
    hash = (hash * 31 + target.charCodeAt(i)) >>> 0;
  }
  // Always include the results-cleaner informational note when that engine runs.
  // For others, pick 1..n templates based on the hash so output feels realistic.
  const count = pool[0].severity === 'INFO'
    ? 1
    : 1 + (hash % Math.max(1, pool.length)); // 1..pool.length
  const selected: FindingTemplate[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(pool[(hash + i) % pool.length]);
  }
  // De-duplicate by title
  const seen = new Set<string>();
  return selected.filter(t => (seen.has(t.title) ? false : (seen.add(t.title), true)));
}
