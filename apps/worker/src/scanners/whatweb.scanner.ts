import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class WhatwebScanner {
  async scan(targetUrl: string): Promise<any> {
    const outputFile = `/tmp/whatweb-${Date.now()}.json`;
    const dockerImage = 'whatweb:latest';

    try {
      // Run WhatWeb in Docker
      const command = `docker run --rm \
        -v /tmp:/tmp \
        ${dockerImage} \
        "${targetUrl}" "${outputFile}"`;

      console.log(`[WhatWeb] Scanning: ${targetUrl}`);
      execSync(command, { stdio: 'inherit' });

      // Read and parse output
      if (fs.existsSync(outputFile)) {
        const rawOutput = fs.readFileSync(outputFile, 'utf-8');
        const result = JSON.parse(rawOutput);
        
        // Clean up
        fs.unlinkSync(outputFile);
        
        return {
          scanner: 'whatweb',
          target: targetUrl,
          technologies: result.technologies || [],
          raw: result,
        };
      }

      return {
        scanner: 'whatweb',
        target: targetUrl,
        technologies: [],
      };
    } catch (error) {
      console.error('[WhatWeb] Scanner error:', error);
      throw error;
    }
  }
}
