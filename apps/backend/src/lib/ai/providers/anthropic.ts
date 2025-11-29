import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, CEFRLevel } from '@teach/shared';
import { AIProvider } from './base';
import { AI_CONVERSATION_PROMPTS } from '../../../prompts/aiConversation';

/**
 * Anthropic AI Provider implementation
 * Uses Claude 3.5 Sonnet
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getSystemPrompt(targetLevel: CEFRLevel): string {
    return AI_CONVERSATION_PROMPTS[targetLevel];
  }

  async *streamResponse(
    messages: ChatMessage[],
    targetLevel: CEFRLevel
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client) {
      throw new Error('Anthropic provider not available - API key not configured');
    }

    const stream = await this.client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: this.getSystemPrompt(targetLevel),
      messages: messages.map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text;
      }
    }
  }
}
