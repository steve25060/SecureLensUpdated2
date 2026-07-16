import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class NmapScanner {
  async scan(target: string): Promise<any> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nmap-'));
    const outputFile = path.join(tempDir, 'nmap.json');
    const dockerImage = 'nmap:latest';

    try {
      const command = `docker run --rm \
        -v "${tempDir}":/tmp \
        ${dockerImage} \
        "${target}" "/tmp/nmap.json"`;

      console.log(`[Nmap] Scanning: ${target}`);
      execSync(command, { stdio: 'inherit' });

      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const results = JSON.parse(rawOutput);

        return {
          scanner: 'nmap',
          target,
          ports: results.ports || [],
          raw: results,
        };
      }

      return {
        scanner: 'nmap',
        target,
        ports: [],
      };
    } catch (error) {
      console.error('[Nmap] Scanner error:', error);
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
