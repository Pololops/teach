import { Hono } from 'hono';
import { correctorService } from '../lib/ai/correctorService';
import { z } from 'zod';

const corrector = new Hono();

/**
 * Request schema for correction
 */
const CorrectRequestSchema = z.object({
  text: z.string().min(1).max(5000),
});

/**
 * POST /api/correct
 * Analyze text and return corrections
 */
corrector.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const request = CorrectRequestSchema.parse(body);

    const correction = await correctorService.correctMessage(request.text);

    return c.json(correction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: error.errors,
        },
        400
      );
    }

    console.error('Corrector route error:', error);

    // Handle rate limit errors
    if (error.status === 429 || error.code === 'rate_limit_exceeded' || error.code === 'insufficient_quota') {
      return c.json(
        {
          code: 'rate_limit_exceeded',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 20,
        },
        429
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      {
        code: 'INTERNAL_ERROR',
        message,
      },
      500
    );
  }
});

export default corrector;
