import { z } from 'zod';

/**
 * Common European Framework of Reference for Languages (CEFR) levels
 * A1-A2: Basic User
 * B1-B2: Independent User
 * C1-C2: Proficient User
 */
export const CEFRLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type CEFRLevel = z.infer<typeof CEFRLevelSchema>;

/**
 * CEFR level change record for tracking user progression
 */
export const LevelChangeSchema = z.object({
  level: CEFRLevelSchema,
  timestamp: z.number(),
  confidence: z.number().min(0).max(1),
});
export type LevelChange = z.infer<typeof LevelChangeSchema>;

/**
 * CEFR metrics for level detection
 */
export const CEFRMetricsSchema = z.object({
  vocabularyComplexity: z.number().min(0).max(1),
  grammarAccuracy: z.number().min(0).max(1),
  sentenceLength: z.number().min(0),
  errorCount: z.number().int().min(0),
});
export type CEFRMetrics = z.infer<typeof CEFRMetricsSchema>;

/**
 * CEFR vocabulary lists (placeholder - will be populated with actual word lists)
 */
export const CEFR_VOCABULARY_LISTS: Record<CEFRLevel, string[]> = {
  A1: [], // Will be populated with common 500-1000 words
  A2: [],
  B1: [],
  B2: [],
  C1: [],
  C2: [],
};
