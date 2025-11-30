import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/shared/stores/gameStore';
import { gameDb } from '@/shared/lib/storage/gameDb';
import { fetchGameQuestion, getGameError } from '@/shared/services/gameService';
import type { GameSession, GameAttempt, CEFRLevel } from '@teach/shared';

const MAX_ATTEMPTS = 2;

interface UseGameSessionOptions {
  userId: string;
  level?: CEFRLevel;
}

/**
 * Hook to manage game session lifecycle and question flow
 */
export function useGameSession({ userId, level = 'A1' }: UseGameSessionOptions) {
  const queryClient = useQueryClient();
  const {
    currentSession,
    currentQuestion,
    currentAttempts,
    usedWords,
    isLoading,
    error,
    showResult,
    setSession,
    setQuestion,
    incrementAttempts,
    resetAttempts,
    addUsedWord,
    clearUsedWords,
    setLoading,
    setError,
    setShowResult,
    resetGame,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize or resume game session
   */
  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get current active session
      let session = await gameDb.getCurrentSession(userId);

      // Create new session if none exists
      if (!session) {
        session = await gameDb.createSession(userId);
      }

      setSession(session);
      clearUsedWords();
      
      // Load first question
      const question = await fetchGameQuestion({ level, previousWords: [] });
      setQuestion(question);
      resetAttempts();
      setShowResult(null);
      
      setIsInitialized(true);
    } catch (err) {
      const appError = getGameError(err);
      setError(appError);
    } finally {
      setLoading(false);
    }
  }, [userId, level, setLoading, setError, setSession, clearUsedWords, setQuestion, resetAttempts, setShowResult]);

  /**
   * Load next question
   */
  const loadNextQuestion = useCallback(async (previousWords: string[]) => {
    try {
      setLoading(true);
      const question = await fetchGameQuestion({ level, previousWords });
      setQuestion(question);
      resetAttempts();
      setShowResult(null);
    } catch (err) {
      const appError = getGameError(err);
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [level, setLoading, setQuestion, resetAttempts, setShowResult, setError]);

  /**
   * Handle answer submission
   */
  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!currentSession || !currentQuestion || isLoading || showResult) return;

      const isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
      const attemptNumber = currentAttempts + 1;

      // Save attempt to database
      const attempt: GameAttempt = {
        id: crypto.randomUUID(),
        sessionId: currentSession.id,
        questionEmoji: currentQuestion.emoji,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: answer,
        isCorrect,
        attemptNumber,
        timestamp: Date.now(),
      };

      await gameDb.saveAttempt(attempt);
      incrementAttempts();

      if (isCorrect) {
        // Correct answer - update session
        const updatedSession: GameSession = {
          ...currentSession,
          score: currentSession.score + (3 - attemptNumber), // 2 points for first try, 1 for second
          correctAnswers: currentSession.correctAnswers + 1,
          totalQuestions: currentSession.totalQuestions + 1,
          currentStreak: currentSession.currentStreak + 1,
        };

        await gameDb.updateSession(updatedSession);
        setSession(updatedSession);
        setShowResult('correct');

        // Add word to used words list
        addUsedWord(currentQuestion.correctAnswer);

        // Wait 3 seconds, then load next question
        setTimeout(async () => {
          await loadNextQuestion([...usedWords, currentQuestion.correctAnswer]);
        }, 3000);

        // Invalidate stats query to refresh
        queryClient.invalidateQueries({ queryKey: ['gameStats', userId] });
      } else if (attemptNumber >= MAX_ATTEMPTS) {
        // Failed after max attempts - update session
        const updatedSession: GameSession = {
          ...currentSession,
          wrongAnswers: currentSession.wrongAnswers + 1,
          totalQuestions: currentSession.totalQuestions + 1,
          currentStreak: 0, // Reset streak on failure
        };

        await gameDb.updateSession(updatedSession);
        setSession(updatedSession);
        setShowResult('wrong');

        // Add word to used words list
        addUsedWord(currentQuestion.correctAnswer);

        // Wait 3 seconds, then load next question
        setTimeout(async () => {
          await loadNextQuestion([...usedWords, currentQuestion.correctAnswer]);
        }, 3000);

        // Invalidate stats query to refresh
        queryClient.invalidateQueries({ queryKey: ['gameStats', userId] });
      } else {
        // Wrong answer but has more attempts - show shake animation
        setShowResult('wrong');
        // Reset after a short delay
        setTimeout(() => {
          setShowResult(null);
        }, 500);
      }
    },
    [
      currentSession,
      currentQuestion,
      currentAttempts,
      usedWords,
      isLoading,
      showResult,
      incrementAttempts,
      setSession,
      setShowResult,
      addUsedWord,
      userId,
      queryClient,
      loadNextQuestion,
    ]
  );

  /**
   * End current game session
   */
  const endGame = useCallback(async () => {
    if (!currentSession) return;

    const updatedSession: GameSession = {
      ...currentSession,
      endedAt: Date.now(),
    };

    await gameDb.updateSession(updatedSession);
    resetGame();
    setIsInitialized(false);

    // Invalidate stats query to refresh
    queryClient.invalidateQueries({ queryKey: ['gameStats', userId] });
  }, [currentSession, resetGame, userId, queryClient]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeGame();
    }
  }, [isInitialized, initializeGame]);

  return {
    session: currentSession,
    question: currentQuestion,
    attempts: currentAttempts,
    maxAttempts: MAX_ATTEMPTS,
    isLoading,
    error,
    showResult,
    submitAnswer,
    endGame,
  };
}

