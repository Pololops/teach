import type { ChatMessage, CEFRLevel, AIProviderType, AppError } from '@teach/shared';
import { parseError, ErrorCode } from '@teach/shared';

const API_BASE_URL = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:3000';

interface StreamEventStart {
  type: 'start';
  provider: string;
}

interface StreamEventContent {
  type: 'content';
  content: string;
}

interface StreamEventError {
  type: 'error';
  code: string;
  message: string;
  status?: number;
  retryAfter?: number;
}

type StreamEvent = StreamEventStart | StreamEventContent | StreamEventError;

export interface ChatStreamOptions {
  messages: ChatMessage[];
  targetLevel: CEFRLevel;
  provider?: AIProviderType;
  onStart?: (provider: string) => void;
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: AppError) => void;
}

/**
 * Stream AI chat response using Server-Sent Events
 */
export async function streamChatResponse(options: ChatStreamOptions): Promise<void> {
  const { messages, targetLevel, provider = 'ollama', onStart, onChunk, onComplete, onError } = options;

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
      const errorData = await response.json().catch(() => ({}));
      const error = parseError({ status: response.status, ...errorData });
      throw error;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw parseError({ code: ErrorCode.CHAT_STREAM_ERROR, message: 'Response body is null' });
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
          } else if (event.type === 'error') {
            // Handle error event from stream
            const error = parseError({
              status: event.status || 500,
              code: event.code,
              message: event.message,
            });
            if (event.retryAfter) {
              error.retryAfter = event.retryAfter;
            }
            throw error;
          }
        } catch (e) {
          // If it's already an AppError, rethrow it
          if (typeof e === 'object' && e !== null && 'code' in e && 'userMessage' in e) {
            throw e;
          }
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  } catch (error) {
    const appError = parseError(error);
    onError?.(appError);
    throw appError;
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw parseError({ status: response.status });
    }
    return response.json();
  } catch (error) {
    throw parseError(error);
  }
}
