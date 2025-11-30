import { Hono } from 'hono';
import { gameService } from '../lib/ai/gameService';
import { z } from 'zod';
import { CEFRLevelSchema } from '@teach/shared';

const game = new Hono();

/**
 * Request schema for game question generation
 */
const GameQuestionRequestSchema = z.object({
  level: CEFRLevelSchema.optional(),
  previousWords: z.array(z.string()).optional(),
});

/**
 * POST /api/game/question
 * Generate a new emoji game question
 */
game.post('/question', async (c) => {
  try {
    const body = await c.req.json();
    const request = GameQuestionRequestSchema.parse(body);

    const question = await gameService.generateQuestion(
      request.level,
      request.previousWords
    );

    return c.json(question);
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

    console.error('Game route error:', error);

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

export default game;

