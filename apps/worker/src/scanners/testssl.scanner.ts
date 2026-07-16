import { execSync } from 'child_process';
import * as fs from 'fs';

export class TestsslScanner {
  async scan(targetUrl: string): Promise<any> {
    const outputFile = `/tmp/testssl-${Date.now()}.json`;
    const dockerImage = 'testssl:latest';

    try {
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${targetUrl}" "${outputFile}"`;

      console.log(`[testssl] Analyzing: ${targetUrl}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = JSON.parse(rawOutput);
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'testssl',
          target: targetUrl,
          findings: results.scans || results.alerts || [],
          raw: results,
        };
      }

      return {
        scanner: 'testssl',
        target: targetUrl,
        findings: [],
      };
    } catch (error) {
      console.error('[testssl] Scanner error:', error);
      throw error;
    }
  }
}
