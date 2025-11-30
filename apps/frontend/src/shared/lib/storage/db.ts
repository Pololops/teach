import Dexie, { type EntityTable } from 'dexie';
import type {
  User,
  Conversation,
  Message,
  ProgressMetrics,
  GameSession,
  GameAttempt,
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
  gameSessions!: EntityTable<GameSession, 'id'>;
  gameAttempts!: EntityTable<GameAttempt, 'id'>;

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

    // Schema version 2: Add game tables
    this.version(2).stores({
      // Keep existing tables
      users: 'id, createdAt',
      conversations: 'id, userId, status, createdAt, updatedAt, [userId+status]',
      messages: 'id, conversationId, timestamp, [conversationId+timestamp]',
      progressMetrics: 'userId, lastActive',

      // Game tables
      gameSessions: 'id, userId, startedAt, endedAt, [userId+startedAt]',
      gameAttempts: 'id, sessionId, timestamp, [sessionId+timestamp]',
    });
  }
}

// Singleton instance
export const db = new TeachDB();
