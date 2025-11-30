import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { ChatStreamRequestSchema } from '@teach/shared';
import { getProvider } from '../lib/ai/index';

const chat = new Hono();

/**
 * POST /api/chat/stream
 * Stream AI conversation response with Server-Sent Events
 */
chat.post('/stream', async (c) => {
  try {
    const body = await c.req.json();
    const request = ChatStreamRequestSchema.parse(body);

    const provider = getProvider(request.provider);

    return streamSSE(c, async (stream) => {
      try {
        await stream.writeSSE({
          data: JSON.stringify({ type: 'start', provider: provider.name }),
        });

        const responseStream = provider.streamResponse(
          request.messages,
          request.targetLevel
        );

        for await (const chunk of responseStream) {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'content', content: chunk }),
          });
        }

        await stream.writeSSE({ data: '[DONE]' });
      } catch (streamError: any) {
        // Error occurred during streaming - send as SSE error event
        console.error('Stream error:', streamError);
        
        // Determine error code based on Ollama-specific errors
        let errorCode = 'ai_provider_error';
        if (streamError.code === 'ECONNREFUSED' || streamError.message?.includes('ECONNREFUSED')) {
          errorCode = 'no_ai_provider';
        } else if (streamError.status === 404 || streamError.message?.includes('model')) {
          errorCode = 'ai_provider_error';
        }
        
        const errorResponse = {
          type: 'error',
          code: errorCode,
          message: streamError.message || 'An error occurred during streaming',
          status: streamError.status,
        };
        
        await stream.writeSSE({
          data: JSON.stringify(errorResponse),
        });
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ code: 'INTERNAL_ERROR', message }, 500);
  }
});

export default chat;
