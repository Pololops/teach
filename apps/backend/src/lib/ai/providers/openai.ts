import OpenAI from 'openai';
import type { ChatMessage, CEFRLevel } from '@teach/shared';
import { AIProvider } from './base';
import { AI_CONVERSATION_PROMPTS } from '../../../prompts/aiConversation';

/**
 * OpenAI AI Provider implementation
 * Uses gpt-4o-mini for cost efficiency
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
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
      throw new Error('OpenAI provider not available - API key not configured');
    }

    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this.getSystemPrompt(targetLevel) },
        ...messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}
