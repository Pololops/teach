import { z } from 'zod';
import { CEFRLevelSchema } from './cefr.js';
import { ChatMessageSchema } from './message.js';

/**
 * AI Provider types
 */
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'auto']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

/**
 * Chat stream request
 */
export const ChatStreamRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(100),
  targetLevel: CEFRLevelSchema,
  provider: AIProviderSchema.optional().default('auto'),
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
