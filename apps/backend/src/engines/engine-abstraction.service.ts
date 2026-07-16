// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { SCANNER_ENGINES, TOOL_IMPLEMENTATION_MAP, ENGINE_CATEGORIES, ENGINES_BY_CATEGORY } from '@securelens/constants';

/**
 * Engine Abstraction Service
 * 
 * This service handles the abstraction layer between internal engine naming
 * and the actual tool implementations. It ensures that:
 * 1. Frontend only sees internal engine names (e.g., 'asset_discovery_engine')
 * 2. Backend knows the actual tool mappings (nmap, httpx, etc.)
 * 3. Tool names are never exposed in API responses
 */

@Injectable()
export class EngineAbstractionService {
  /**
   * Get all available engines with their display information
   * Never exposes actual tool names
   */
  getAvailableEngines() {
    return Object.entries(SCANNER_ENGINES).map(([key, engineId]) => ({
      id: engineId,
      name: TOOL_IMPLEMENTATION_MAP[engineId].displayName,
      description: TOOL_IMPLEMENTATION_MAP[engineId].description,
      category: this.getEngineCategory(engineId),
    }));
  }

  /**
   * Get engines by category
   */
  getEnginesByCategory(category: string) {
    const engineIds = ENGINES_BY_CATEGORY[category] || [];
    return engineIds.map((engineId) => ({
      id: engineId,
      name: TOOL_IMPLEMENTATION_MAP[engineId].displayName,
      description: TOOL_IMPLEMENTATION_MAP[engineId].description,
    }));
  }

  /**
   * Get category for an engine
   */
  getEngineCategory(engineId: string): string {
    for (const [category, engines] of Object.entries(ENGINES_BY_CATEGORY)) {
      if (engines.includes(engineId as any)) {
        return category;
      }
    }
    return 'unknown';
  }

  /**
   * Get actual tool implementations (backend only)
   * Should never be exposed to frontend
   */
  getToolImplementation(engineId: string) {
    return TOOL_IMPLEMENTATION_MAP[engineId];
  }

  /**
   * Get all actual tools for an engine (internal use only)
   */
  getEngineTools(engineId: string): string[] {
    const impl = TOOL_IMPLEMENTATION_MAP[engineId];
    return impl ? impl.tools : [];
  }

  /**
   * Validate if engine exists
   */
  isValidEngine(engineId: string): boolean {
    return engineId in TOOL_IMPLEMENTATION_MAP;
  }

  /**
   * Get engines for a scan mode
   */
  getEnginesForScanMode(mode: 'website' | 'github' | 'combined') {
    if (mode === 'website') {
      return this.getEnginesByCategory(ENGINE_CATEGORIES.WEBSITE_ANALYSIS);
    } else if (mode === 'github') {
      return this.getEnginesByCategory(ENGINE_CATEGORIES.CODE_ANALYSIS);
    } else {
      // Combined: website + code analysis
      return [
        ...this.getEnginesByCategory(ENGINE_CATEGORIES.WEBSITE_ANALYSIS),
        ...this.getEnginesByCategory(ENGINE_CATEGORIES.CODE_ANALYSIS),
      ];
    }
  }

  /**
   * Sanitize scan result - ensure no tool names are exposed
   */
  sanitizeFinding(finding: any) {
    const sanitized = { ...finding };
    // Remove any internal tool information
    delete sanitized.tool;
    delete sanitized.toolVersion;
    delete sanitized.rawOutput;
    return sanitized;
  }

  /**
   * Get engine display name (safe for frontend)
   */
  getEngineName(engineId: string): string {
    return TOOL_IMPLEMENTATION_MAP[engineId]?.displayName || 'Unknown Engine';
  }

  /**
   * Map all constants for frontend (safe export)
   */
  getConstantsForFrontend() {
    return {
      SCANNER_ENGINES: Object.values(SCANNER_ENGINES),
      ENGINE_CATEGORIES,
      ENGINES_BY_CATEGORY: Object.fromEntries(
        Object.entries(ENGINES_BY_CATEGORY).map(([category, engines]) => [
          category,
          engines.map((engineId) => ({
            id: engineId,
            name: TOOL_IMPLEMENTATION_MAP[engineId].displayName,
          })),
        ])
      ),
    };
  }
}
