// Tool abstraction layer - Internal names for security engines
// Actual tool names are hidden from frontend

export const SCANNER_ENGINES = {
  // Asset Discovery
  ASSET_DISCOVERY: 'asset_discovery_engine',
  
  // Technology Detection
  TECH_DETECTION: 'tech_detection_engine',
  
  // SSL/TLS Analysis
  SSL_TLS_ANALYSIS: 'ssl_tls_analysis_engine',
  
  // Vulnerability Detection
  VULNERABILITY_SCAN: 'vulnerability_detection_engine',
  
  // Runtime Security
  RUNTIME_SECURITY: 'runtime_security_engine',
  
  // API Security
  API_SECURITY: 'api_security_engine',
  
  // Code Security
  CODE_SECURITY: 'code_security_engine',
  
  // Secret Detection
  SECRET_DETECTION: 'secret_detection_engine',
  
  // Dependency Analysis
  DEPENDENCY_ANALYSIS: 'dependency_analysis_engine',
  
  // Infrastructure Security
  INFRASTRUCTURE_SECURITY: 'infrastructure_security_engine',
} as const;

// Mapping of internal names to actual tools (backend only, never exposed to frontend)
export const TOOL_IMPLEMENTATION_MAP = {
  [SCANNER_ENGINES.ASSET_DISCOVERY]: {
    tools: ['nmap', 'httpx', 'dnsx'],
    displayName: 'Asset Discovery',
    description: 'Discovers external attack surface',
  },
  [SCANNER_ENGINES.TECH_DETECTION]: {
    tools: ['whatweb'],
    displayName: 'Technology Detection',
    description: 'Identifies web technologies and frameworks',
  },
  [SCANNER_ENGINES.SSL_TLS_ANALYSIS]: {
    tools: ['testssl.sh'],
    displayName: 'SSL/TLS Analysis',
    description: 'Analyzes SSL/TLS configuration',
  },
  [SCANNER_ENGINES.VULNERABILITY_SCAN]: {
    tools: ['nuclei'],
    displayName: 'Vulnerability Scanner',
    description: 'Detects known vulnerabilities and CVEs',
  },
  [SCANNER_ENGINES.RUNTIME_SECURITY]: {
    tools: ['owasp-zap'],
    displayName: 'Runtime Security',
    description: 'Tests runtime security issues',
  },
  [SCANNER_ENGINES.API_SECURITY]: {
    tools: ['owasp-zap'],
    displayName: 'API Security',
    description: 'Analyzes API security',
  },
  [SCANNER_ENGINES.CODE_SECURITY]: {
    tools: ['semgrep'],
    displayName: 'Code Security',
    description: 'Scans source code for security issues',
  },
  [SCANNER_ENGINES.SECRET_DETECTION]: {
    tools: ['gitleaks'],
    displayName: 'Secret Detection',
    description: 'Detects exposed secrets and credentials',
  },
  [SCANNER_ENGINES.DEPENDENCY_ANALYSIS]: {
    tools: ['trivy'],
    displayName: 'Dependency Analysis',
    description: 'Finds vulnerable dependencies',
  },
  [SCANNER_ENGINES.INFRASTRUCTURE_SECURITY]: {
    tools: ['checkov'],
    displayName: 'Infrastructure Security',
    description: 'Analyzes infrastructure configuration',
  },
} as const;

// Engine Categories for UI
export const ENGINE_CATEGORIES = {
  WEBSITE_ANALYSIS: 'website_analysis',
  CODE_ANALYSIS: 'code_analysis',
  INFRASTRUCTURE: 'infrastructure',
} as const;

// Categorized engines
export const ENGINES_BY_CATEGORY = {
  [ENGINE_CATEGORIES.WEBSITE_ANALYSIS]: [
    SCANNER_ENGINES.ASSET_DISCOVERY,
    SCANNER_ENGINES.TECH_DETECTION,
    SCANNER_ENGINES.SSL_TLS_ANALYSIS,
    SCANNER_ENGINES.VULNERABILITY_SCAN,
    SCANNER_ENGINES.RUNTIME_SECURITY,
    SCANNER_ENGINES.API_SECURITY,
  ],
  [ENGINE_CATEGORIES.CODE_ANALYSIS]: [
    SCANNER_ENGINES.CODE_SECURITY,
    SCANNER_ENGINES.SECRET_DETECTION,
    SCANNER_ENGINES.DEPENDENCY_ANALYSIS,
  ],
  [ENGINE_CATEGORIES.INFRASTRUCTURE]: [
    SCANNER_ENGINES.INFRASTRUCTURE_SECURITY,
  ],
} as const;

// Severity Levels
export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

// Finding Categories
export const FINDING_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  API_SECURITY: 'api_security',
  HEADERS: 'headers',
  COOKIES: 'cookies',
  SSL_TLS: 'ssl_tls',
  SECRETS: 'secrets',
  DEPENDENCIES: 'dependencies',
  CODE_QUALITY: 'code_quality',
  INFRASTRUCTURE: 'infrastructure',
  CONFIGURATION: 'configuration',
} as const;

// Risk Levels
export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

// Scan Modes
export const SCAN_MODES = {
  WEBSITE: 'website',
  GITHUB: 'github',
  COMBINED: 'combined',
} as const;

// Scan Status
export const SCAN_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export default {
  SCANNER_ENGINES,
  TOOL_IMPLEMENTATION_MAP,
  ENGINE_CATEGORIES,
  ENGINES_BY_CATEGORY,
  SEVERITY_LEVELS,
  FINDING_CATEGORIES,
  RISK_LEVELS,
  SCAN_MODES,
  SCAN_STATUS,
};
