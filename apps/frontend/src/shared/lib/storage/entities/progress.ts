import { db } from '../db';
import type { ProgressMetrics, LevelChange, CEFRLevel } from '@teach/shared';

/**
 * Get progress metrics for a user
 * Creates default metrics if none exist
 */
export async function getProgress(userId: string): Promise<ProgressMetrics> {
  const existing = await db.progressMetrics.get(userId);

  if (!existing) {
    const defaultMetrics: ProgressMetrics = {
      userId,
      currentLevel: 'A1',
      levelHistory: [],
      totalConversations: 0,
      totalMessages: 0,
      totalTime: 0,
      vocabularyEncountered: [],
      vocabularyMastered: [],
      topicsDiscussed: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.progressMetrics.add(defaultMetrics);
    return defaultMetrics;
  }

  return existing;
}

/**
 * Update progress metrics
 */
export async function updateProgress(
  userId: string,
  updates: Partial<Omit<ProgressMetrics, 'userId' | 'createdAt'>>
): Promise<void> {
  await db.progressMetrics.update(userId, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Track new vocabulary encountered
 */
export async function trackVocabulary(
  userId: string,
  words: string[]
): Promise<void> {
  const progress = await getProgress(userId);
  const uniqueWords = new Set([...progress.vocabularyEncountered, ...words]);

  await db.progressMetrics.update(userId, {
    vocabularyEncountered: Array.from(uniqueWords),
    updatedAt: Date.now(),
  });
}

/**
 * Mark vocabulary as mastered
 */
export async function markVocabularyMastered(
  userId: string,
  word: string
): Promise<void> {
  const progress = await getProgress(userId);

  if (!progress.vocabularyMastered.includes(word)) {
    await db.progressMetrics.update(userId, {
      vocabularyMastered: [...progress.vocabularyMastered, word],
      updatedAt: Date.now(),
    });
  }
}

/**
 * Track level change
 */
export async function trackLevelChange(
  userId: string,
  level: CEFRLevel,
  confidence: number
): Promise<void> {
  const progress = await getProgress(userId);

  const levelChange: LevelChange = {
    level,
    timestamp: Date.now(),
    confidence,
  };

  await db.progressMetrics.update(userId, {
    currentLevel: level,
    levelHistory: [...progress.levelHistory, levelChange],
    updatedAt: Date.now(),
  });
}

/**
 * Increment conversation count
 */
export async function incrementConversationCount(userId: string): Promise<void> {
  const progress = await getProgress(userId);

  await db.progressMetrics.update(userId, {
    totalConversations: progress.totalConversations + 1,
    updatedAt: Date.now(),
  });
}

/**
 * Increment user's total message count
 */
export async function incrementUserMessageCount(userId: string): Promise<void> {
  const progress = await getProgress(userId);

  await db.progressMetrics.update(userId, {
    totalMessages: progress.totalMessages + 1,
    updatedAt: Date.now(),
  });
}

/**
 * Track conversation time (in seconds)
 */
export async function trackConversationTime(
  userId: string,
  durationSeconds: number
): Promise<void> {
  const progress = await getProgress(userId);

  await db.progressMetrics.update(userId, {
    totalTime: progress.totalTime + durationSeconds,
    lastActive: Date.now(),
    updatedAt: Date.now(),
  });
}
