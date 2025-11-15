import { z } from 'zod';
import { CEFRLevelSchema, LevelChangeSchema } from './cefr.js';

/**
 * Progress metrics for user learning tracking
 */
export const ProgressMetricsSchema = z.object({
  userId: z.string().uuid(),
  currentLevel: CEFRLevelSchema,
  levelHistory: z.array(LevelChangeSchema),
  totalConversations: z.number().int().min(0),
  totalMessages: z.number().int().min(0),
  totalTime: z.number().int().min(0), // seconds
  vocabularyEncountered: z.array(z.string()),
  vocabularyMastered: z.array(z.string()),
  topicsDiscussed: z.array(z.string()),
  lastActive: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type ProgressMetrics = z.infer<typeof ProgressMetricsSchema>;

/**
 * Computed progress metrics (not stored, calculated on read)
 */
export interface ComputedProgressMetrics {
  averageMessagesPerConversation: number;
  averageSessionDuration: number; // seconds
  vocabularyGrowthRate: number; // new words per hour
  currentStreak: number; // consecutive days active
  longestStreak: number; // max consecutive days
}
