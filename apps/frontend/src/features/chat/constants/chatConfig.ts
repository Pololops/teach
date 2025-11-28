/**
 * Chat Configuration Constants
 *
 * Configuration for conversation context management, token limits,
 * and chat behavior settings.
 */

/**
 * Maximum number of messages to include in context window
 * This prevents token limit issues while maintaining conversation coherence
 */
export const CONTEXT_WINDOW_SIZE = 15;

/**
 * Minimum number of recent messages to always include
 * These are kept even if token limits would suggest trimming
 */
export const ALWAYS_INCLUDE_RECENT = 5;

/**
 * Estimated maximum tokens to send in a single request
 * Conservative limit to work with most AI providers (OpenAI, Anthropic)
 */
export const MAX_TOKENS_ESTIMATE = 3000;

/**
 * Average tokens per message (rough estimate)
 * Used for quick token estimation: ~4 characters = 1 token
 */
export const TOKENS_PER_MESSAGE_AVG = 100;

/**
 * Maximum number of messages allowed by API schema
 * Hard limit from backend validation
 */
export const MAX_MESSAGES_API = 100;

/**
 * Enable debug logging for context management
 * Set to true to see context window decisions in console
 */
export const DEBUG_CONTEXT = false;
