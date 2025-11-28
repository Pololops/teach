import type { Message } from '@teach/shared';
import {
  CONTEXT_WINDOW_SIZE,
  ALWAYS_INCLUDE_RECENT,
  MAX_TOKENS_ESTIMATE,
  MAX_MESSAGES_API,
  DEBUG_CONTEXT,
} from '../constants/chatConfig';

/**
 * Simplified message format for API requests
 */
export interface ContextMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Context window statistics for debugging and UI display
 */
export interface ContextWindowStats {
  totalMessages: number;
  includedMessages: number;
  estimatedTokens: number;
  truncated: boolean;
}

/**
 * Estimate token count for a message
 * Uses rough approximation: ~4 characters = 1 token
 */
export function estimateTokens(message: Message | ContextMessage): number {
  const contentLength = message.content.length;
  // Add extra tokens for role and formatting (~10 tokens)
  const baseTokens = Math.ceil(contentLength / 4);
  return baseTokens + 10;
}

/**
 * Estimate total tokens for an array of messages
 */
export function estimateTotalTokens(messages: (Message | ContextMessage)[]): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg), 0);
}

/**
 * Filter out system/metadata messages if needed
 * Currently keeps all messages, but can be extended for filtering
 */
function filterMessages(messages: Message[]): Message[] {
  // Filter out any messages that shouldn't be sent to AI
  // For now, we keep all messages including system messages
  return messages;
}

/**
 * Build smart context window from conversation history
 *
 * Strategy:
 * 1. Always include the most recent N messages (ALWAYS_INCLUDE_RECENT)
 * 2. Include older messages up to CONTEXT_WINDOW_SIZE if within token limit
 * 3. Respect MAX_MESSAGES_API hard limit
 * 4. Trim from the middle-old messages first if needed
 *
 * @param messages - Full conversation history from IndexedDB
 * @returns Object with context messages and stats
 */
export function buildContextWindow(
  messages: Message[]
): { context: ContextMessage[]; stats: ContextWindowStats } {
  const filtered = filterMessages(messages);
  const totalMessages = filtered.length;

  // If conversation is short, include everything
  if (totalMessages <= CONTEXT_WINDOW_SIZE) {
    const context = filtered.map((msg) => ({
      role: msg.role === 'system' ? ('assistant' as const) : msg.role,
      content: msg.content,
    }));

    const stats: ContextWindowStats = {
      totalMessages,
      includedMessages: totalMessages,
      estimatedTokens: estimateTotalTokens(context),
      truncated: false,
    };

    if (DEBUG_CONTEXT) {
      console.log('[Context] Short conversation - including all messages', stats);
    }

    return { context, stats };
  }

  // For longer conversations, use sliding window approach
  // Always keep the most recent messages
  const recentMessages = filtered.slice(-ALWAYS_INCLUDE_RECENT);
  let selectedMessages = [...recentMessages];

  // Calculate how many more messages we can include
  const remainingSlots = Math.min(
    CONTEXT_WINDOW_SIZE - ALWAYS_INCLUDE_RECENT,
    MAX_MESSAGES_API - ALWAYS_INCLUDE_RECENT
  );

  if (remainingSlots > 0) {
    // Get messages before the "always include" window
    const olderMessages = filtered.slice(0, -ALWAYS_INCLUDE_RECENT);

    // Take the most recent of the older messages
    const additionalMessages = olderMessages.slice(-remainingSlots);

    // Combine: older context + recent messages
    selectedMessages = [...additionalMessages, ...recentMessages];
  }

  // Convert to context format
  const context = selectedMessages.map((msg) => ({
    role: msg.role === 'system' ? ('assistant' as const) : msg.role,
    content: msg.content,
  }));

  // Token-based trimming (if still over limit)
  let estimatedTokens = estimateTotalTokens(context);

  if (estimatedTokens > MAX_TOKENS_ESTIMATE) {
    // Trim from the oldest messages until we're under the limit
    // But never go below ALWAYS_INCLUDE_RECENT
    while (
      context.length > ALWAYS_INCLUDE_RECENT &&
      estimatedTokens > MAX_TOKENS_ESTIMATE
    ) {
      // Remove the oldest message
      const removed = context.shift();
      if (removed) {
        estimatedTokens -= estimateTokens(removed);
      }
    }

    if (DEBUG_CONTEXT) {
      console.log(
        '[Context] Trimmed messages to fit token limit',
        `${selectedMessages.length} → ${context.length} messages`
      );
    }
  }

  const stats: ContextWindowStats = {
    totalMessages,
    includedMessages: context.length,
    estimatedTokens,
    truncated: context.length < totalMessages,
  };

  if (DEBUG_CONTEXT) {
    console.log('[Context] Built context window', {
      total: totalMessages,
      included: context.length,
      tokens: estimatedTokens,
      truncated: stats.truncated,
    });
  }

  return { context, stats };
}

/**
 * Append a new message to the context window
 * Useful for adding the current user message before sending
 */
export function appendToContext(
  context: ContextMessage[],
  message: { role: 'user' | 'assistant' | 'system'; content: string }
): ContextMessage[] {
  return [...context, message];
}
