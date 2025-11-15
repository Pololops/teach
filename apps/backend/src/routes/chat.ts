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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ code: 'INTERNAL_ERROR', message }, 500);
  }
});

export default chat;
