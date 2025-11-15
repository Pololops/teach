import { db } from '../db';
import type { Message, MessageRole, MessageMetadata } from '@teach/shared';

/**
 * Add a new message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  metadata?: MessageMetadata
): Promise<Message> {
  const message: Message = {
    id: crypto.randomUUID(),
    conversationId,
    role,
    content,
    timestamp: Date.now(),
    metadata,
  };

  await db.messages.add(message);
  return message;
}

/**
 * Get all messages for a conversation (sorted by timestamp)
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
}

/**
 * Get a single message by ID
 */
export async function getMessage(id: string): Promise<Message | undefined> {
  return db.messages.get(id);
}

/**
 * Update message metadata (e.g., add corrections, suggestions)
 */
export async function updateMessageMetadata(
  id: string,
  metadata: MessageMetadata
): Promise<void> {
  await db.messages.update(id, { metadata });
}

/**
 * Delete messages for a conversation (cascade delete)
 */
export async function deleteConversationMessages(conversationId: string): Promise<void> {
  await db.messages.where('conversationId').equals(conversationId).delete();
}
