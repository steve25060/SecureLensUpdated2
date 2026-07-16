import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnifiedFinding } from '@securelens/findings-schema';

/**
 * AI Security Copilot Service
 * 
 * Provides AI-powered explanations and remediation guidance for security findings
 * Integrates with OpenAI (ChatGPT) or Claude
 */

@Injectable()
export class AICopilotService {
  private readonly logger = new Logger(AICopilotService.name);
  private readonly apiKey: string;
  private readonly provider: 'openai' | 'claude';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('OPENAI_API_KEY') || 
                  this.configService.get('CLAUDE_API_KEY') || '';
    
    this.provider = this.configService.get('OPENAI_API_KEY') ? 'openai' : 'claude';
    
    if (!this.apiKey) {
      this.logger.warn('AI API key not configured - AI features will be limited');
    }
  }

  /**
   * Generate explanation for a finding
   */
  async explainFinding(finding: UnifiedFinding): Promise<string> {
    if (!this.apiKey) {
      return this.generateSimpleExplanation(finding);
    }

    try {
      const prompt = this.buildExplanationPrompt(finding);
      const response = await this.callAIAPI(prompt);
      return response;
    } catch (error) {
      this.logger.error(`Failed to explain finding: ${error.message}`);
      return this.generateSimpleExplanation(finding);
    }
  }

  /**
   * Generate remediation suggestions
   */
  async suggestRemediation(finding: UnifiedFinding): Promise<string> {
    if (!this.apiKey) {
      return this.generateSimpleRemediation(finding);
    }

    try {
      const prompt = this.buildRemediationPrompt(finding);
      const response = await this.callAIAPI(prompt);
      return response;
    } catch (error) {
      this.logger.error(`Failed to suggest remediation: ${error.message}`);
      return this.generateSimpleRemediation(finding);
    }
  }

  /**
   * Explain attack scenario
   */
  async explainAttackScenario(finding: UnifiedFinding): Promise<string> {
    if (!this.apiKey) {
      return `An attacker could exploit the ${finding.title} vulnerability to compromise the application.`;
    }

    try {
      const prompt = this.buildAttackScenarioPrompt(finding);
      const response = await this.callAIAPI(prompt);
      return response;
    } catch (error) {
      this.logger.error(`Failed to explain attack scenario: ${error.message}`);
      return `Attack scenario unavailable. Please review the finding details.`;
    }
  }

  /**
   * Generate secure code example
   */
  async generateSecureCodeExample(finding: UnifiedFinding): Promise<string> {
    if (!this.apiKey) {
      return `No secure code example available. Please refer to official documentation for ${finding.title}.`;
    }

    try {
      const prompt = this.buildCodeExamplePrompt(finding);
      const response = await this.callAIAPI(prompt);
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate code example: ${error.message}`);
      return `Code example generation failed. Please check official security guidelines.`;
    }
  }

  /**
   * Answer follow-up question about a finding
   */
  async answerQuestion(
    finding: UnifiedFinding,
    question: string,
  ): Promise<string> {
    if (!this.apiKey) {
      return `I don't have enough context to answer this question. Please review the finding details.`;
    }

    try {
      const prompt = this.buildQuestionPrompt(finding, question);
      const response = await this.callAIAPI(prompt);
      return response;
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`);
      return `Unable to answer. Please try rephrasing your question.`;
    }
  }

  /**
   * Build explanation prompt
   */
  private buildExplanationPrompt(finding: UnifiedFinding): string {
    return `
You are a security expert helping developers understand vulnerability reports.

Finding Title: ${finding.title}
Description: ${finding.description}
Severity: ${finding.severity}
Category: ${finding.category}
Source/Engine: ${finding.source}
${finding.evidence ? `Evidence: ${finding.evidence}` : ''}
${finding.cwe ? `CWE: ${finding.cwe}` : ''}
${finding.cve ? `CVE: ${finding.cve}` : ''}

Please provide a clear, developer-friendly explanation of this security finding:
1. What is the vulnerability?
2. Why is it a security concern?
3. What are the potential consequences if not fixed?
4. What is the business impact?

Keep the explanation concise (2-3 paragraphs) and use simple technical language.
`;
  }

  /**
   * Build remediation prompt
   */
  private buildRemediationPrompt(finding: UnifiedFinding): string {
    return `
You are a security expert providing remediation guidance.

Finding: ${finding.title}
Severity: ${finding.severity}
Category: ${finding.category}
${finding.remediation ? `Suggested Fix: ${finding.remediation}` : ''}

Please provide step-by-step remediation guidance:
1. Immediate actions to take
2. Detailed fix implementation
3. Testing/verification steps
4. Prevention measures for the future
5. Resources or references

Keep it practical and actionable for developers.
`;
  }

  /**
   * Build attack scenario prompt
   */
  private buildAttackScenarioPrompt(finding: UnifiedFinding): string {
    return `
You are a security expert explaining real-world attack scenarios.

Vulnerability: ${finding.title}
Description: ${finding.description}
Target: ${finding.targetUrl}

Please describe a realistic attack scenario:
1. How would an attacker discover this vulnerability?
2. What steps would they take to exploit it?
3. What data or systems could be compromised?
4. What would the attacker achieve with this exploit?

Make it educational but realistic (2-3 paragraphs).
`;
  }

  /**
   * Build code example prompt
   */
  private buildCodeExamplePrompt(finding: UnifiedFinding): string {
    return `
You are a security expert providing secure code examples.

Issue: ${finding.title}
${finding.remediation ? `Recommended Fix: ${finding.remediation}` : ''}

Please provide:
1. A VULNERABLE code example showing the problem
2. A SECURE code example showing the fix
3. Key differences and why the secure version is better

Use practical, real-world code patterns. Include comments explaining the security aspects.
`;
  }

  /**
   * Build question prompt
   */
  private buildQuestionPrompt(finding: UnifiedFinding, question: string): string {
    return `
You are a security expert answering developer questions about security findings.

Vulnerability: ${finding.title}
Description: ${finding.description}
Severity: ${finding.severity}

Developer's Question: ${question}

Please answer concisely and helpfully. If the question is outside the scope of this finding, politely redirect.
`;
  }

  /**
   * Call AI API (OpenAI or Claude)
   */
  private async callAIAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    try {
      if (this.provider === 'openai') {
        return await this.callOpenAI(prompt);
      } else {
        return await this.callClaude(prompt);
      }
    } catch (error) {
      this.logger.error(`AI API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a security expert helping developers understand and fix vulnerabilities. Be concise, practical, and educational.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      this.logger.error(`OpenAI API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 500,
          system: 'You are a security expert helping developers understand and fix vulnerabilities. Be concise, practical, and educational.',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || 'Unable to generate response';
    } catch (error) {
      this.logger.error(`Claude API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate simple explanation without AI
   */
  private generateSimpleExplanation(finding: UnifiedFinding): string {
    return `
${finding.title}

This is a ${finding.severity} severity issue in the ${finding.category} category.

Description: ${finding.description}

${finding.evidence ? `Evidence: ${finding.evidence}\n` : ''}

Affected Target: ${finding.targetUrl || 'Not specified'}

To understand this issue better, consult the references and remediation guidance provided.
`;
  }

  /**
   * Generate simple remediation without AI
   */
  private generateSimpleRemediation(finding: UnifiedFinding): string {
    return finding.remediation || `
No specific remediation available. 

General guidance for ${finding.category} issues:
1. Review the finding details carefully
2. Consult relevant security documentation
3. Implement appropriate fixes
4. Test thoroughly before deployment
5. Monitor for related issues

For detailed guidance, enable AI Copilot by providing an OpenAI or Claude API key.
`;
  }

  /**
   * Check if AI is configured
   */
  isAIConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get current provider
   */
  getProvider(): string {
    return this.provider;
  }
}
