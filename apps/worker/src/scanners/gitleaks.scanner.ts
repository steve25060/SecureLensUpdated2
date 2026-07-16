import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '@nestjs/common';

/**
 * Gitleaks Scanner
 * Executes gitleaks in Docker to detect secrets in repositories
 */
export class GitleaksScanner {
  private readonly logger = new Logger(GitleaksScanner.name);
  private readonly dockerImage = 'ghcr.io/gitleaks/gitleaks:latest';

  /**
   * Scan a GitHub repository for secrets
   */
  async scanRepository(
    repoUrl: string,
    scanId: string,
    outputDir: string,
  ): Promise<any> {
    try {
      this.logger.log(`Starting Gitleaks scan for: ${repoUrl}`);

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const reportFile = path.join(outputDir, `gitleaks-${scanId}.json`);
      const clonedRepo = path.join(outputDir, `repo-${scanId}`);

      // Clone repository
      this.logger.log(`Cloning repository: ${repoUrl}`);
      try {
        execSync(`git clone --depth 1 ${repoUrl} ${clonedRepo}`, {
          stdio: 'pipe',
        });
      } catch (error) {
        this.logger.error(`Failed to clone repository: ${error}`);
        throw new Error(`Repository clone failed: ${repoUrl}`);
      }

      // Run Gitleaks scan
      this.logger.log(`Running Gitleaks scan on cloned repo`);
      try {
        const command = `docker run --rm -v ${clonedRepo}:/repo ${this.dockerImage} detect --source /repo --report-format json --report-path /tmp/report.json`;
        execSync(command, { stdio: 'pipe' });
      } catch (error) {
        // Gitleaks returns exit code 1 if findings are found, which is expected
        this.logger.log(`Gitleaks scan completed (exit code indicates findings)`);
      }

      // Parse results
      const results = this.parseGitleaksResults(reportFile);

      // Cleanup cloned repo
      this.logger.log(`Cleaning up cloned repository`);
      try {
        execSync(`rm -rf ${clonedRepo}`, { stdio: 'pipe' });
      } catch (error) {
        this.logger.warn(`Failed to cleanup cloned repo: ${error}`);
      }

      this.logger.log(
        `Gitleaks scan completed: ${results.findings.length} secrets found`,
      );

      return results;
    } catch (error) {
      this.logger.error(
        `Gitleaks scan failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Scan local git repository
   */
  async scanLocalRepository(
    repoPath: string,
    scanId: string,
    outputDir: string,
  ): Promise<any> {
    try {
      this.logger.log(`Starting Gitleaks scan for local repo: ${repoPath}`);

      // Verify repository exists
      if (!fs.existsSync(path.join(repoPath, '.git'))) {
        throw new Error(`Not a valid git repository: ${repoPath}`);
      }

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const reportFile = path.join(outputDir, `gitleaks-${scanId}.json`);

      // Run Gitleaks scan via Docker
      this.logger.log(`Running Gitleaks scan`);
      try {
        const command = `docker run --rm -v ${repoPath}:/repo ${this.dockerImage} detect --source /repo --report-format json --report-path /tmp/report.json`;
        execSync(command, { stdio: 'pipe' });
      } catch (error) {
        // Exit code 1 means findings were found (expected)
        this.logger.log(`Gitleaks scan completed with findings`);
      }

      // Parse results
      const results = this.parseGitleaksResults(reportFile);

      this.logger.log(
        `Gitleaks scan completed: ${results.findings.length} secrets found`,
      );

      return results;
    } catch (error) {
      this.logger.error(
        `Gitleaks scan failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Parse Gitleaks JSON report
   */
  private parseGitleaksResults(reportFile: string): any {
    const findings: any[] = [];

    try {
      if (fs.existsSync(reportFile)) {
        const content = fs.readFileSync(reportFile, 'utf-8');
        const data = JSON.parse(content);

        if (data.Leaks && Array.isArray(data.Leaks)) {
          for (const leak of data.Leaks) {
            findings.push({
              RuleTitle: leak.RuleTitle,
              RuleID: leak.RuleID,
              Match: leak.Match,
              File: leak.File,
              Line: leak.Line,
              Column: leak.Column,
              Commit: leak.Commit,
              CommitDate: leak.CommitDate,
              Author: leak.Author,
              Email: leak.Email,
              Message: leak.Message,
              Entropy: leak.Entropy,
            });
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to parse Gitleaks report: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      tool: 'gitleaks',
      findings,
      timestamp: new Date(),
    };
  }

  /**
   * Get mock results for testing (when Docker is not available)
   */
  getMockResults(): any {
    return {
      tool: 'gitleaks',
      findings: [
        {
          RuleTitle: 'AWS API Key',
          RuleID: 'aws-api-key',
          Match: 'AKIAIOSFODNN7EXAMPLE',
          File: 'config/credentials.ts',
          Line: 42,
          Column: 15,
          Commit: 'abc123def456',
          CommitDate: new Date().toISOString(),
          Author: 'developer@example.com',
          Email: 'developer@example.com',
          Message: 'Add AWS configuration',
          Entropy: 8.5,
        },
        {
          RuleTitle: 'GitHub Token',
          RuleID: 'github-token',
          Match: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          File: 'scripts/deploy.sh',
          Line: 18,
          Column: 8,
          Commit: 'def456abc789',
          CommitDate: new Date().toISOString(),
          Author: 'devops@example.com',
          Email: 'devops@example.com',
          Message: 'Fix deployment script',
          Entropy: 8.9,
        },
      ],
      timestamp: new Date(),
    };
  }
}
