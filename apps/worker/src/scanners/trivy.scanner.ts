import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class TrivyScanner {
  async scan(target: string): Promise<any> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trivy-'));
    const outputFile = path.join(tempDir, 'trivy.json');
    const dockerImage = 'trivy:latest';

    try {
      const command = `docker run --rm \
        -v "${tempDir}":/tmp \
        -v /var/run/docker.sock:/var/run/docker.sock \
        ${dockerImage} \
        "${target}" "/tmp/trivy.json"`;

      console.log(`[Trivy] Scanning: ${target}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = JSON.parse(rawOutput);

        return {
          scanner: 'trivy',
          target,
          findings: results.Results || [],
          raw: results,
        };
      }

      return {
        scanner: 'trivy',
        target,
        findings: [],
      };
    } catch (error) {
      console.error('[Trivy] Scanner error:', error);
      throw error;
    } finally {
      try {
        execSync(`rm -rf "${tempDir}"`);
      } catch (e) {
        console.warn(`Failed to clean up temp directory: ${tempDir}`);
      }
    }
  }
}
