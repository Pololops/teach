import OpenAI from 'openai';
import type { ChatMessage, CEFRLevel } from '@teach/shared';
import { AIProvider } from './base';
import { AI_CONVERSATION_PROMPTS } from '../../../prompts/aiConversation';

/**
 * Ollama AI Provider implementation
 * Uses local Ollama instance with llama3.1 model
 */
export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  private client: OpenAI;
  private model: string;

  constructor() {
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1';
    
    // Use OpenAI SDK with Ollama's OpenAI-compatible API
    // No API key needed for local Ollama
    this.client = new OpenAI({
      baseURL,
      apiKey: 'ollama', // Required by SDK but not used by Ollama
    });
  }

  isAvailable(): boolean {
    // Always return true for local Ollama - connection errors will be caught at runtime
    return true;
  }

  getSystemPrompt(targetLevel: CEFRLevel): string {
    return AI_CONVERSATION_PROMPTS[targetLevel];
  }

  async *streamResponse(
    messages: ChatMessage[],
    targetLevel: CEFRLevel
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
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
    } catch (error: any) {
      // Transform Ollama connection errors to user-friendly messages
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }
      if (error.status === 404 || error.message?.includes('model')) {
        throw new Error(`Model '${this.model}' not found. Please pull the model with: ollama pull ${this.model}`);
      }
      throw error;
    }
  }
}

