import { execSync } from 'child_process';
import * as fs from 'fs';

export class DnsxScanner {
  async scan(domain: string): Promise<any> {
    const outputFile = `/tmp/dnsx-${Date.now()}.json`;
    const dockerImage = 'dnsx:latest';

    try {
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${domain}" "${outputFile}"`;

      console.log(`[DNSX] Resolving: ${domain}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = rawOutput.split('\n').filter((l: string) => l.trim()).map((l: string) => JSON.parse(l));
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'dnsx',
          target: domain,
          discoveries: results,
          raw: results,
        };
      }

      return {
        scanner: 'dnsx',
        target: domain,
        discoveries: [],
      };
    } catch (error) {
      console.error('[DNSX] Scanner error:', error);
      throw error;
    }
  }
}
