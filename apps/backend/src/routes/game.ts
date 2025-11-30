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
  } catch (error) {
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

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Game route error:', error);

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

