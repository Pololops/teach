import type { Message, MessageRole, MessageMetadata } from '@teach/shared';

/**
 * Shadcn ChatMessage interface
 * Based on shadcn-chatbot-kit expected message format
 */
export interface ShadcnMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  metadata?: MessageMetadata;
}

/**
 * Transform IndexedDB Message to Shadcn ChatMessage format
 * @param message - Message from IndexedDB
 * @returns ShadcnMessage compatible with shadcn-chatbot-kit components
 */
export function toShadcnMessage(message: Message): ShadcnMessage {
  return {
    id: message.id,
    role: message.role === 'system' ? 'assistant' : message.role,
    content: message.content,
    createdAt: new Date(message.timestamp),
    metadata: message.metadata,
  };
}

/**
 * Transform multiple IndexedDB Messages to Shadcn format
 * @param messages - Array of Messages from IndexedDB
 * @returns Array of ShadcnMessages
 */
export function toShadcnMessages(messages: Message[]): ShadcnMessage[] {
  return messages.map(toShadcnMessage);
}

/**
 * Create a partial Message object from Shadcn format (for adding to IndexedDB)
 * Note: This doesn't include id, conversationId, or timestamp - those should be added by the storage layer
 * @param shadcnMessage - Message in Shadcn format
 * @returns Partial Message data (role and content only)
 */
export function fromShadcnMessage(shadcnMessage: ShadcnMessage): {
  role: MessageRole;
  content: string;
} {
  return {
    role: shadcnMessage.role,
    content: shadcnMessage.content,
  };
}
