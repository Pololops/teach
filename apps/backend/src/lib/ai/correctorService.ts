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
  private client: OpenAI;
  private model: string;

  constructor() {
    // Initialize Ollama client using OpenAI-compatible API
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1';
    
    this.client = new OpenAI({
      baseURL,
      apiKey: 'ollama', // Required by SDK but not used by Ollama
    });
  }

  /**
   * Correct a text message and return structured corrections
   */
  async correctMessage(text: string): Promise<CorrectionResponse> {
    try {
      return await this.correctWithOllama(text);
    } catch (error: any) {
      console.error('Corrector service error:', error);
      
      // Transform Ollama-specific errors
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }
      if (error.status === 404 || error.message?.includes('model')) {
        throw new Error(`Model '${this.model}' not found. Please pull the model with: ollama pull ${this.model}`);
      }
      
      // Return no errors on other failures (graceful degradation)
      return { hasErrors: false };
    }
  }

  /**
   * Correct using Ollama
   */
  private async correctWithOllama(text: string): Promise<CorrectionResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
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
