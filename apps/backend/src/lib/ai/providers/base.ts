import type { ChatMessage, CEFRLevel } from '@teach/shared';

/**
 * AI Provider interface
 * All AI providers must implement this interface for unified access
 */
export interface AIProvider {
  /**
   * Provider name (e.g., 'openai', 'anthropic')
   */
  readonly name: string;

  /**
   * Stream AI response for given messages and target CEFR level
   * Returns an async generator that yields content chunks
   */
  streamResponse(
    messages: ChatMessage[],
    targetLevel: CEFRLevel
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Get system prompt for the given CEFR level
   * This tailors the AI's response complexity to the user's level
   */
  getSystemPrompt(targetLevel: CEFRLevel): string;

  /**
   * Check if the provider is available (API key configured)
   */
  isAvailable(): boolean;
}
