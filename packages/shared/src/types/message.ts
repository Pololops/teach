import { z } from 'zod';
import { CEFRLevelSchema } from './cefr.js';

/**
 * Message role in conversation
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

/**
 * Correction types for grammar/vocabulary feedback
 */
export const CorrectionTypeSchema = z.enum([
  'grammar',
  'spelling',
  'vocabulary',
  'punctuation',
  'style',
]);
export type CorrectionType = z.infer<typeof CorrectionTypeSchema>;

export const CorrectionSeveritySchema = z.enum(['critical', 'major', 'minor']);
export type CorrectionSeverity = z.infer<typeof CorrectionSeveritySchema>;

/**
 * Text position for highlighting corrections
 */
export const TextPositionSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
});
export type TextPosition = z.infer<typeof TextPositionSchema>;

/**
 * Grammar/vocabulary correction
 */
export const CorrectionSchema = z.object({
  id: z.string().uuid(),
  type: CorrectionTypeSchema,
  original: z.string().min(1),
  suggested: z.string().min(1),
  explanation: z.string().min(10).max(200),
  severity: CorrectionSeveritySchema,
  position: TextPositionSchema,
});
export type Correction = z.infer<typeof CorrectionSchema>;

/**
 * Suggestion types for contextual help
 */
export const SuggestionTypeSchema = z.enum([
  'vocabulary',
  'phrase',
  'response',
  'question',
]);
export type SuggestionType = z.infer<typeof SuggestionTypeSchema>;

/**
 * Contextual suggestion to help user continue conversation
 */
export const SuggestionSchema = z.object({
  id: z.string().uuid(),
  type: SuggestionTypeSchema,
  text: z.string().min(1).max(200),
  context: z.string().min(10).max(300),
  level: CEFRLevelSchema,
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

/**
 * AI-driven correction change
 */
export const AICorrectionChangeSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  original: z.string().min(1),
  corrected: z.string().min(1),
  type: z.enum(['spelling', 'grammar', 'vocabulary', 'conjugation']),
});
export type AICorrectionChange = z.infer<typeof AICorrectionChangeSchema>;

/**
 * AI-driven correction data
 */
export const AICorrectionSchema = z.object({
  correctedText: z.string(),
  changes: z.array(AICorrectionChangeSchema),
});
export type AICorrection = z.infer<typeof AICorrectionSchema>;

/**
 * Message metadata for analysis and feedback
 */
export const MessageMetadataSchema = z.object({
  // For user messages
  detectedLevel: CEFRLevelSchema.optional(),
  vocabularyComplexity: z.number().min(0).max(1).optional(),
  grammarAccuracy: z.number().min(0).max(1).optional(),
  sentenceLength: z.number().min(0).optional(),
  errorCount: z.number().int().min(0).optional(),

  // For assistant messages
  targetLevel: CEFRLevelSchema.optional(),
  vocabularyUsed: z.array(z.string()).optional(),

  // For both
  corrections: z.array(CorrectionSchema).optional(),
  suggestions: z.array(SuggestionSchema).optional(),

  // AI-driven correction (replaces rule-based corrections)
  aiCorrection: AICorrectionSchema.optional(),
});
export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;

/**
 * Chat message
 */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1).max(5000),
  timestamp: z.number(),
  metadata: MessageMetadataSchema.optional(),
});
export type Message = z.infer<typeof MessageSchema>;

/**
 * Chat message for API (simplified, without IDs/metadata)
 */
export const ChatMessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1).max(5000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
