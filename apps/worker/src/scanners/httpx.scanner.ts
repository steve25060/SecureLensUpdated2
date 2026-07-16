import { execSync } from 'child_process';
import * as fs from 'fs';

export class HttpxScanner {
  async scan(targetUrl: string): Promise<any> {
    const outputFile = `/tmp/httpx-${Date.now()}.json`;
    const dockerImage = 'httpx:latest';

    try {
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${targetUrl}" "${outputFile}"`;

      console.log(`[HTTPX] Probing: ${targetUrl}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = rawOutput.split('\n').filter((l: string) => l.trim()).map((l: string) => JSON.parse(l));
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'httpx',
          target: targetUrl,
          probes: results,
          raw: results,
        };
      }

      return {
        scanner: 'httpx',
        target: targetUrl,
        probes: [],
      };
    } catch (error) {
      console.error('[HTTPX] Scanner error:', error);
      throw error;
    }
  }
}
