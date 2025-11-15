import type { ChatMessage, CEFRLevel, AIProviderType } from '@teach/shared';

const API_BASE_URL = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:3000';

interface StreamEventStart {
  type: 'start';
  provider: string;
}

interface StreamEventContent {
  type: 'content';
  content: string;
}

type StreamEvent = StreamEventStart | StreamEventContent;

export interface ChatStreamOptions {
  messages: ChatMessage[];
  targetLevel: CEFRLevel;
  provider?: AIProviderType;
  onStart?: (provider: string) => void;
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Stream AI chat response using Server-Sent Events
 */
export async function streamChatResponse(options: ChatStreamOptions): Promise<void> {
  const { messages, targetLevel, provider = 'auto', onStart, onChunk, onComplete, onError } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        targetLevel,
        provider,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;

        const data = line.slice(6); // Remove 'data: ' prefix
        if (data === '[DONE]') {
          onComplete?.();
          return;
        }

        try {
          const event: StreamEvent = JSON.parse(data);

          if (event.type === 'start') {
            onStart?.(event.provider);
          } else if (event.type === 'content') {
            onChunk?.(event.content);
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    onError?.(err);
    throw err;
  }
}

/**
 * Check backend health and available providers
 */
export async function checkHealth(): Promise<{
  status: string;
  version: string;
  timestamp: string;
  providers: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
