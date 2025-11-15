import { z } from 'zod';
import { CEFRLevelSchema } from './cefr.js';

/**
 * User preferences
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  showCorrections: z.boolean(),
  showSuggestions: z.boolean(),
  aiProvider: z.enum(['openai', 'anthropic', 'auto']),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/**
 * User entity (anonymous, local-first)
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(50).optional(),
  currentLevel: CEFRLevelSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  preferences: UserPreferencesSchema,
});
export type User = z.infer<typeof UserSchema>;

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  showCorrections: true,
  showSuggestions: true,
  aiProvider: 'auto',
};
