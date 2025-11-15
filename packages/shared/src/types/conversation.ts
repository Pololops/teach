import { z } from 'zod';
import { CEFRLevelSchema } from './cefr.js';

/**
 * Conversation status
 */
export const ConversationStatusSchema = z.enum(['active', 'archived', 'deleted']);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

/**
 * Conversation entity
 */
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(100),
  difficultyLevel: CEFRLevelSchema,
  status: ConversationStatusSchema,
  messageCount: z.number().int().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Conversation = z.infer<typeof ConversationSchema>;
