import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_CORRECTOR_PROMPT } from '../../prompts/aiCorrector';

interface CorrectionChange {
  start: number;
  end: number;
  original: string;
  corrected: string;
  type: 'spelling' | 'grammar' | 'vocabulary' | 'conjugation';
}

export interface CorrectionResponse {
  hasErrors: boolean;
  correctedText?: string;
  changes?: CorrectionChange[];
}

/**
 * Corrector Service - Analyzes text for errors and returns corrections
 */
export class CorrectorService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize available AI clients
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
  }

  /**
   * Correct a text message and return structured corrections
   */
  async correctMessage(text: string): Promise<CorrectionResponse> {
    try {
      // Try OpenAI first (lower latency), fallback to Anthropic
      if (this.openai) {
        return await this.correctWithOpenAI(text);
      } else if (this.anthropic) {
        return await this.correctWithAnthropic(text);
      } else {
        throw new Error('No AI provider available');
      }
    } catch (error) {
      console.error('Corrector service error:', error);
      // Return no errors on failure (graceful degradation)
      return { hasErrors: false };
    }
  }

  /**
   * Correct using OpenAI
   */
  private async correctWithOpenAI(text: string): Promise<CorrectionResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not available');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: AI_CORRECTOR_PROMPT,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent corrections
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseCorrection(content);
  }

  /**
   * Correct using Anthropic
   */
  private async correctWithAnthropic(text: string): Promise<CorrectionResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not available');
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent corrections
      system: AI_CORRECTOR_PROMPT,
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const content =
      response.content[0]?.type === 'text' ? response.content[0].text : '';
    return this.parseCorrection(content);
  }

  /**
   * Parse AI response into structured correction data
   */
  private parseCorrection(response: string): CorrectionResponse {
    try {
      // Clean up response - remove markdown code blocks if present
      let cleaned = response.trim();

      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      cleaned = cleaned.trim();

      // Parse JSON
      const parsed = JSON.parse(cleaned);

      // Validate structure
      if (typeof parsed.hasErrors !== 'boolean') {
        throw new Error('Invalid response structure: missing hasErrors');
      }

      if (!parsed.hasErrors) {
        return { hasErrors: false };
      }

      // Validate required fields when hasErrors is true
      if (!parsed.correctedText || !Array.isArray(parsed.changes)) {
        throw new Error('Invalid response structure: missing correctedText or changes');
      }

      // Validate each change
      const validChanges = parsed.changes.filter((change: any) => {
        return (
          typeof change.start === 'number' &&
          typeof change.end === 'number' &&
          typeof change.original === 'string' &&
          typeof change.corrected === 'string' &&
          typeof change.type === 'string' &&
          ['spelling', 'grammar', 'vocabulary', 'conjugation'].includes(change.type)
        );
      });

      return {
        hasErrors: true,
        correctedText: parsed.correctedText,
        changes: validChanges,
      };
    } catch (error) {
      console.error('Failed to parse correction response:', error);
      console.error('Response was:', response);
      // Return no errors on parse failure
      return { hasErrors: false };
    }
  }
}

export const correctorService = new CorrectorService();
