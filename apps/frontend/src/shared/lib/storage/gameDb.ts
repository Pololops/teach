import { db } from './db';
import type {
  GameSession,
  GameAttempt,
  GameStats,
} from '@teach/shared';

/**
 * Game Database Operations
 */
export class GameDb {
  /**
   * Create a new game session
   */
  async createSession(userId: string): Promise<GameSession> {
    const session: GameSession = {
      id: crypto.randomUUID(),
      userId,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalQuestions: 0,
      currentStreak: 0,
      startedAt: Date.now(),
      endedAt: null,
    };

    await db.gameSessions.add(session);
    return session;
  }

  /**
   * Update an existing game session
   */
  async updateSession(session: GameSession): Promise<void> {
    await db.gameSessions.put(session);
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<GameSession | undefined> {
    return await db.gameSessions.get(sessionId);
  }

  /**
   * Get current active session for a user (not ended)
   */
  async getCurrentSession(userId: string): Promise<GameSession | undefined> {
    return await db.gameSessions
      .where('[userId+startedAt]')
      .between([userId, 0], [userId, Infinity])
      .filter((s) => s.endedAt === null)
      .last();
  }

  /**
   * Save a game attempt
   */
  async saveAttempt(attempt: GameAttempt): Promise<void> {
    await db.gameAttempts.add(attempt);
  }

  /**
   * Get all attempts for a session
   */
  async getSessionAttempts(sessionId: string): Promise<GameAttempt[]> {
    return await db.gameAttempts
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');
  }

  /**
   * Get game statistics for a user
   */
  async getStats(userId: string): Promise<GameStats> {
    const sessions = await db.gameSessions
      .where('userId')
      .equals(userId)
      .toArray();

    if (sessions.length === 0) {
      const stats: GameStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracy: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalSessions: 0,
        averageScore: 0,
      };
      return stats;
    }

    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const wrongAnswers = sessions.reduce((sum, s) => sum + s.wrongAnswers, 0);
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    const bestStreak = Math.max(...sessions.map((s) => s.currentStreak), 0);
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const averageScore = sessions.length > 0 ? totalScore / sessions.length : 0;

    // Current streak is from the most recent active session
    const currentSession = await this.getCurrentSession(userId);
    const currentStreak = currentSession?.currentStreak || 0;

    const stats: GameStats = {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      currentStreak,
      bestStreak,
      totalSessions: sessions.length,
      averageScore,
    };

    return stats;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<GameSession[]> {
    return await db.gameSessions
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('startedAt');
  }
}

export const gameDb = new GameDb();

