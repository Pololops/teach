import { z } from 'zod';
import { CEFRLevelSchema } from './cefr.js';
import { ChatMessageSchema, AICorrectionChangeSchema } from './message.js';

/**
 * AI Provider types
 */
export const AIProviderSchema = z.enum(['ollama']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

/**
 * Chat stream request
 */
export const ChatStreamRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(100),
  targetLevel: CEFRLevelSchema,
  provider: AIProviderSchema.optional().default('ollama'),
  stream: z.boolean().optional().default(true),
});
export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;

/**
 * Chat message response (non-streaming)
 */
export const ChatMessageResponseSchema = z.object({
  message: ChatMessageSchema,
  metadata: z.object({
    provider: z.string(),
    model: z.string(),
    tokensUsed: z.number().int().optional(),
  }),
});
export type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;

/**
 * API Error response
 */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Health check response
 */
export const HealthResponseSchema = z.object({
  status: z.literal('healthy'),
  version: z.string(),
  timestamp: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Correct message request
 */
export const CorrectMessageRequestSchema = z.object({
  text: z.string().min(1).max(5000),
});
export type CorrectMessageRequest = z.infer<typeof CorrectMessageRequestSchema>;

/**
 * Correct message response
 */
export const CorrectMessageResponseSchema = z.object({
  hasErrors: z.boolean(),
  correctedText: z.string().optional(),
  changes: z.array(AICorrectionChangeSchema).optional(),
});
export type CorrectMessageResponse = z.infer<typeof CorrectMessageResponseSchema>;
