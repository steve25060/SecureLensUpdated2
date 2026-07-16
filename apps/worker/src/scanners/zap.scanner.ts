import { execSync } from 'child_process';
import * as fs from 'fs';

export class ZapScanner {
  async scan(targetUrl: string): Promise<any> {
    const outputFile = `/tmp/zap-${Date.now()}.json`;
    const dockerImage = 'zap:latest';

    try {
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${targetUrl}" "${outputFile}"`;

      console.log(`[ZAP] Scanning: ${targetUrl}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = JSON.parse(rawOutput);
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'zap',
          target: targetUrl,
          findings: results.alerts || results.scan_results || [],
          raw: results,
        };
      }

      return {
        scanner: 'zap',
        target: targetUrl,
        findings: [],
      };
    } catch (error) {
      console.error('[ZAP] Scanner error:', error);
      throw error;
    }
  }
}
