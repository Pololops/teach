import type { CEFRLevel, GameQuestion } from '@teach/shared';

const API_BASE_URL = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:3000';

export interface FetchQuestionOptions {
  level?: CEFRLevel;
  previousWords?: string[];
}

/**
 * Fetch a new game question from the backend
 */
export async function fetchGameQuestion(
  options: FetchQuestionOptions = {}
): Promise<GameQuestion> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: options.level,
        previousWords: options.previousWords,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data as GameQuestion;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Failed to fetch game question:', err);
    throw err;
  }
}

