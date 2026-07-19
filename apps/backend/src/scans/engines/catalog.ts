/**
 * Engine catalog — single source of truth for scan engines.
 *
 * Why friendly names? Showing raw tool names (nmap, nuclei, gitleaks…) makes the
 * product look like a raw wrapper around CLI tools. Users want to understand
 * *what is being checked*, not which binary does it. So every engine exposes a
 * human-friendly `name` + `description` while keeping an internal `id`.
 *
 * The catalog is shared by:
 *   - ScansController   (GET /scans/engines/*)
 *   - ScansService      (validation + execution)
 *   - the scan executor  (which checks each engine produces)
 */
export type ScanMode = 'website' | 'github' | 'combined';

export interface EngineDefinition {
  /** Stable internal id, stored on Scan.engines[]. */
  id: string;
  /** Human-friendly name shown in the UI. */
  name: string;
  /** One-line description of what it checks. */
  description: string;
  /** High-level category for grouping in the UI. */
  category: string;
  /** Icon key the frontend can map to a lucide icon. */
  icon: string;
  /** Which scan modes this engine applies to. */
  modes: ScanMode[];
}

export const ENGINE_CATALOG: EngineDefinition[] = [
  {
    id: 'port_scanner',
    name: 'Port Scanner',
    description: 'Finds open ports and running services on the target host.',
    category: 'Network Reconnaissance',
    icon: 'network',
    modes: ['website', 'combined'],
  },
  {
    id: 'website_finder',
    name: 'Website Finder',
    description: 'Discovers live hosts, subdomains, and hidden endpoints.',
    category: 'Asset Discovery',
    icon: 'globe',
    modes: ['website', 'combined'],
  },
  {
    id: 'vulnerability_scanner',
    name: 'Vulnerability Scanner',
    description: 'Detects known CVEs, injections, and misconfigurations.',
    category: 'Vulnerability Detection',
    icon: 'bug',
    modes: ['website', 'github', 'combined'],
  },
  {
    id: 'website_info',
    name: 'Website Info',
    description: 'Identifies technologies, frameworks, and server software.',
    category: 'Technology Detection',
    icon: 'info',
    modes: ['website', 'combined'],
  },
  {
    id: 'ssl_checker',
    name: 'SSL Checker',
    description: 'Analyzes TLS/SSL certificate strength and configuration.',
    category: 'Encryption',
    icon: 'lock',
    modes: ['website', 'combined'],
  },
  {
    id: 'code_scanner',
    name: 'Code Scanner',
    description: 'Scans source code for insecure patterns and injection risks.',
    category: 'Static Analysis',
    icon: 'code',
    modes: ['github', 'combined'],
  },
  {
    id: 'container_checker',
    name: 'Container Checker',
    description: 'Inspects dependencies and container images for known flaws.',
    category: 'Supply Chain',
    icon: 'box',
    modes: ['github', 'combined'],
  },
  {
    id: 'secret_finder',
    name: 'Secret Finder',
    description: 'Hunts for leaked API keys, tokens, and passwords in code.',
    category: 'Secret Detection',
    icon: 'key',
    modes: ['github', 'combined'],
  },
  {
    id: 'results_cleaner',
    name: 'Results Cleaner',
    description: 'De-duplicates and correlates findings from all engines.',
    category: 'Correlation',
    icon: 'filter',
    modes: ['website', 'github', 'combined'],
  },
];

export const ENGINES_BY_MODE: Record<ScanMode, EngineDefinition[]> = {
  website: ENGINE_CATALOG.filter(e => e.modes.includes('website')),
  github: ENGINE_CATALOG.filter(e => e.modes.includes('github')),
  combined: ENGINE_CATALOG.filter(e => e.modes.includes('combined')),
};

export function enginesForMode(mode: string): EngineDefinition[] {
  return ENGINES_BY_MODE[mode as ScanMode] ?? ENGINE_CATALOG;
}

export function engineById(id: string): EngineDefinition | undefined {
  return ENGINE_CATALOG.find(e => e.id === id);
}

export function isValidEngineId(id: string): boolean {
  return ENGINE_CATALOG.some(e => e.id === id);
}

/** IDs that are valid for a given mode. */
export function validEngineIdsForMode(mode: string): string[] {
  return enginesForMode(mode).map(e => e.id);
}
