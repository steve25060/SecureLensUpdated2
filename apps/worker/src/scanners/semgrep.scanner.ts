import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class SemgrepScanner {
  async scan(repoUrl: string): Promise<any> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'semgrep-'));
    const repoDir = path.join(tempDir, 'repo');
    const outputFile = path.join(tempDir, 'semgrep.json');
    const dockerImage = 'semgrep:latest';

    try {
      // Create repo directory
      fs.mkdirSync(repoDir, { recursive: true });

      // Clone repository
      console.log(`[Semgrep] Cloning ${repoUrl}`);
      execSync(`git clone --depth 1 "${repoUrl}" "${repoDir}"`, {
        stdio: 'pipe',
      });

      // Run Semgrep in Docker
      const command = `docker run --rm \
        -v "${tempDir}":/tmp \
        ${dockerImage} \
        "/tmp/repo" "/tmp/semgrep.json"`;

      console.log(`[Semgrep] Running code security scan`);
      execSync(command, { stdio: 'inherit' });

      // Read and parse output
      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const result = JSON.parse(rawOutput);

        return {
          scanner: 'semgrep',
          target: repoUrl,
          findings: result.results || [],
          raw: result,
        };
      }

      return {
        scanner: 'semgrep',
        target: repoUrl,
        findings: [],
      };
    } catch (error) {
      console.error('[Semgrep] Scanner error:', error);
      throw error;
    } finally {
      // Clean up
      try {
        execSync(`rm -rf "${tempDir}"`);
      } catch (e) {
        console.warn(`Failed to clean up temp directory: ${tempDir}`);
      }
    }
  }
}
