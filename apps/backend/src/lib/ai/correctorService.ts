import OpenAI from 'openai';
import { AI_CORRECTOR_PROMPT } from '../../prompts/aiCorrector';
import { calculatePositions } from './diffUtils';

interface CorrectionChange {
  start: number;
  end: number;
  original: string;
  corrected: string;
  explanation: string;
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
    return this.parseCorrection(content, text);
  }

  /**
   * Parse AI response into structured correction data
   */
  private parseCorrection(response: string, originalText: string): CorrectionResponse {
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
      if (!parsed.correctedText) {
        throw new Error('Invalid response structure: missing correctedText');
      }

      // Calculate accurate positions using diff algorithm
      const changes = calculatePositions(originalText, parsed.correctedText);

      // If AI provided explanation hints, match them to our calculated positions
      if (parsed.changeHints && Array.isArray(parsed.changeHints) && parsed.changeHints.length > 0) {
        console.log('AI provided changeHints:', JSON.stringify(parsed.changeHints, null, 2));
        const matchedChanges = this.matchExplanations(changes, parsed.changeHints);
        console.log('Matched changes:', JSON.stringify(matchedChanges, null, 2));
        return {
          hasErrors: true,
          correctedText: parsed.correctedText,
          changes: matchedChanges,
        };
      }

      console.log('No changeHints from AI, using changes without explanations');
      console.log('Calculated changes:', JSON.stringify(changes, null, 2));

      return {
        hasErrors: true,
        correctedText: parsed.correctedText,
        changes,
      };
    } catch (error) {
      console.error('Failed to parse correction response:', error);
      console.error('Response was:', response);
      // Return no errors on parse failure
      return { hasErrors: false };
    }
  }

  /**
   * Match AI explanation hints to calculated positions
   * This allows AI to provide accurate explanations while we calculate positions
   */
  private matchExplanations(
    changes: CorrectionChange[],
    hints: Array<{ original?: string; corrected?: string; explanation?: string }>
  ): CorrectionChange[] {
    return changes.map((change) => {
      // Try to find a matching hint based on original or corrected text
      const matchingHint = hints.find(
        (hint) =>
          (hint.original && change.original.includes(hint.original)) ||
          (hint.original && hint.original.includes(change.original)) ||
          (hint.corrected && change.corrected.includes(hint.corrected)) ||
          (hint.corrected && hint.corrected.includes(change.corrected))
      );

      if (matchingHint?.explanation) {
        return {
          ...change,
          explanation: matchingHint.explanation,
        };
      }

      // Keep empty explanation if no hint matches
      return change;
    });
  }
}

export const correctorService = new CorrectorService();
