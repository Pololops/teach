import { db } from '../db';
import type { Conversation, ConversationStatus } from '@teach/shared';

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  title: string,
  difficultyLevel: Conversation['difficultyLevel']
): Promise<Conversation> {
  const now = Date.now();
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    userId,
    title,
    difficultyLevel,
    status: 'active',
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.conversations.add(conversation);
  return conversation;
}

/**
 * Get all conversations for a user
 */
export async function getConversations(
  userId: string,
  status?: ConversationStatus
): Promise<Conversation[]> {
  let query = db.conversations.where('userId').equals(userId);

  if (status) {
    query = query.and((conv) => conv.status === status);
  }

  return query.reverse().sortBy('createdAt');
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | undefined> {
  return db.conversations.get(id);
}

/**
 * Update conversation
 */
export async function updateConversation(
  id: string,
  updates: Partial<Omit<Conversation, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await db.conversations.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Update conversation status (with validation)
 */
export async function updateConversationStatus(
  id: string,
  status: ConversationStatus
): Promise<void> {
  const conversation = await db.conversations.get(id);
  if (!conversation) throw new Error('Conversation not found');

  // Validate state transition: cannot go from 'deleted' to other states
  if (conversation.status === 'deleted' && status !== 'deleted') {
    throw new Error('Cannot restore deleted conversation');
  }

  await db.conversations.update(id, {
    status,
    updatedAt: Date.now(),
  });
}

/**
 * Increment message count
 */
export async function incrementMessageCount(conversationId: string): Promise<void> {
  const conversation = await db.conversations.get(conversationId);
  if (!conversation) throw new Error('Conversation not found');

  await db.conversations.update(conversationId, {
    messageCount: conversation.messageCount + 1,
    updatedAt: Date.now(),
  });
}

/**
 * Delete conversation (soft delete)
 */
export async function deleteConversation(id: string): Promise<void> {
  await updateConversationStatus(id, 'deleted');
}
