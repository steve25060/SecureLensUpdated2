import { execSync } from 'child_process';
import * as fs from 'fs';

export class NucleiScanner {
  async scan(targetUrl: string): Promise<any> {
    const outputFile = `/tmp/nuclei-${Date.now()}.json`;
    const dockerImage = 'nuclei:latest';

    try {
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${targetUrl}" "${outputFile}"`;

      console.log(`[Nuclei] Scanning: ${targetUrl}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const findings = rawOutput.split('\n').filter((l: string) => l.trim()).map((l: string) => JSON.parse(l));
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'nuclei',
          target: targetUrl,
          findings,
          raw: findings,
        };
      }

      return {
        scanner: 'nuclei',
        target: targetUrl,
        findings: [],
      };
    } catch (error) {
      console.error('[Nuclei] Scanner error:', error);
      throw error;
    }
  }
}
