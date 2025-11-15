import Dexie, { type EntityTable } from 'dexie';
import type {
  User,
  Conversation,
  Message,
  ProgressMetrics,
} from '@teach/shared';

/**
 * Teach IndexedDB Database
 * Local-first storage for all user data (MVP - no cloud sync)
 */
export class TeachDB extends Dexie {
  // Tables
  users!: EntityTable<User, 'id'>;
  conversations!: EntityTable<Conversation, 'id'>;
  messages!: EntityTable<Message, 'id'>;
  progressMetrics!: EntityTable<ProgressMetrics, 'userId'>;

  constructor() {
    super('TeachDB');

    // Schema version 1
    this.version(1).stores({
      // Users table: single anonymous user record
      users: 'id, createdAt',

      // Conversations table
      conversations: 'id, userId, status, createdAt, updatedAt, [userId+status]',

      // Messages table
      messages: 'id, conversationId, timestamp, [conversationId+timestamp]',

      // Progress metrics table: one record per user
      progressMetrics: 'userId, lastActive',
    });
  }
}

// Singleton instance
export const db = new TeachDB();
