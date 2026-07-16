import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AICopilotService } from './ai-copilot.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnifiedFinding } from '@securelens/findings-schema';

@Controller('api/ai-copilot')
@UseGuards(JwtAuthGuard)
export class AICopilotController {
  constructor(
    private aiCopilot: AICopilotService,
    private prisma: PrismaService,
  ) {}

  /**
   * Explain a finding
   */
  @Post('explain')
  @HttpCode(200)
  async explainFinding(@Body() body: { findingId: string }) {
    try {
      const finding = await this.prisma.finding.findUnique({
        where: { id: body.findingId },
      });

      if (!finding) {
        return { error: 'Finding not found' };
      }

      // Convert to UnifiedFinding format for AI service
      const unifiedFinding = this.convertToUnifiedFinding(finding);
      const explanation = await this.aiCopilot.explainFinding(unifiedFinding);

      // Save explanation to database
      await this.prisma.finding.update({
        where: { id: body.findingId },
        data: { aiExplanation: explanation },
      });

      return { explanation };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Get remediation suggestions
   */
  @Post('remediate')
  @HttpCode(200)
  async suggestRemediation(@Body() body: { findingId: string }) {
    try {
      const finding = await this.prisma.finding.findUnique({
        where: { id: body.findingId },
      });

      if (!finding) {
        return { error: 'Finding not found' };
      }

      const unifiedFinding = this.convertToUnifiedFinding(finding);
      const remediation = await this.aiCopilot.suggestRemediation(unifiedFinding);

      // Save remediation to database
      await this.prisma.finding.update({
        where: { id: body.findingId },
        data: { remediation },
      });

      return { remediation };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Explain attack scenario
   */
  @Post('attack-scenario')
  @HttpCode(200)
  async explainAttackScenario(@Body() body: { findingId: string }) {
    try {
      const finding = await this.prisma.finding.findUnique({
        where: { id: body.findingId },
      });

      if (!finding) {
        return { error: 'Finding not found' };
      }

      const unifiedFinding = this.convertToUnifiedFinding(finding);
      const scenario = await this.aiCopilot.explainAttackScenario(unifiedFinding);

      return { scenario };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Generate secure code example
   */
  @Post('code-example')
  @HttpCode(200)
  async generateCodeExample(@Body() body: { findingId: string }) {
    try {
      const finding = await this.prisma.finding.findUnique({
        where: { id: body.findingId },
      });

      if (!finding) {
        return { error: 'Finding not found' };
      }

      const unifiedFinding = this.convertToUnifiedFinding(finding);
      const code = await this.aiCopilot.generateSecureCodeExample(unifiedFinding);

      return { code };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Answer question about a finding
   */
  @Post('question')
  @HttpCode(200)
  async answerQuestion(
    @Body() body: { findingId: string; question: string },
  ) {
    try {
      const finding = await this.prisma.finding.findUnique({
        where: { id: body.findingId },
      });

      if (!finding) {
        return { error: 'Finding not found' };
      }

      const unifiedFinding = this.convertToUnifiedFinding(finding);
      const answer = await this.aiCopilot.answerQuestion(
        unifiedFinding,
        body.question,
      );

      return { answer };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Check if AI is configured
   */
  @Get('status')
  getAIStatus() {
    return {
      configured: this.aiCopilot.isAIConfigured(),
      provider: this.aiCopilot.getProvider(),
    };
  }

  /**
   * Convert database Finding to UnifiedFinding
   */
  private convertToUnifiedFinding(finding: any): UnifiedFinding {
    return {
      id: finding.id,
      scanId: finding.scanId,
      workspaceId: finding.workspaceId,
      title: finding.title,
      description: finding.description,
      severity: finding.severity,
      status: finding.status,
      category: finding.category,
      source: finding.source,
      engine: 'unknown',
      targetUrl: finding.url,
      targetPath: finding.parameter,
      evidence: finding.evidence,
      remediation: finding.remediation,
      cwe: finding.cwe,
      cvss: finding.cvss,
      owasp: finding.owasp,
      aiExplanation: finding.aiExplanation,
      firstSeen: finding.firstSeen,
      lastSeen: finding.lastSeen,
      resolvedAt: finding.resolvedAt,
      createdAt: finding.createdAt,
      updatedAt: finding.updatedAt,
    };
  }
}
