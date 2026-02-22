import { getNextLevel, getPreviousLevel } from '@teach/shared';
import type { CEFRLevel, GameSession } from '@teach/shared';

const MIN_QUESTIONS_FOR_LEVEL_CHANGE = 5;
const LEVEL_UP_THRESHOLD = 0.8;
const LEVEL_DOWN_THRESHOLD = 0.3;

type LevelChangeReason = 'level_up' | 'level_down' | 'no_change' | 'insufficient_data';

interface LevelEvaluationResult {
  shouldChange: boolean;
  newLevel: CEFRLevel | null;
  reason: LevelChangeReason;
}

/**
 * Evaluate whether a game session warrants a level change.
 * Pure function — no side effects.
 */
export function evaluateGameLevelChange(
  session: GameSession,
  currentLevel: CEFRLevel
): LevelEvaluationResult {
  if (session.totalQuestions < MIN_QUESTIONS_FOR_LEVEL_CHANGE) {
    return { shouldChange: false, newLevel: null, reason: 'insufficient_data' };
  }

  const accuracy = session.correctAnswers / session.totalQuestions;

  if (accuracy >= LEVEL_UP_THRESHOLD) {
    const next = getNextLevel(currentLevel);
    return next
      ? { shouldChange: true, newLevel: next, reason: 'level_up' }
      : { shouldChange: false, newLevel: null, reason: 'no_change' };
  }

  if (accuracy <= LEVEL_DOWN_THRESHOLD) {
    const prev = getPreviousLevel(currentLevel);
    return prev
      ? { shouldChange: true, newLevel: prev, reason: 'level_down' }
      : { shouldChange: false, newLevel: null, reason: 'no_change' };
  }

  return { shouldChange: false, newLevel: null, reason: 'no_change' };
}
