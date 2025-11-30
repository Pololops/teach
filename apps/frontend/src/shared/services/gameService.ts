import type { CEFRLevel, GameQuestion } from '@teach/shared';
import { parseError, ErrorCode, createError } from '@teach/shared';
import type { AppError } from '@teach/shared';

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
      
      // Create structured error based on status
      const error: AppError = {
        ...parseError({ status: response.status, ...errorData }),
        code: response.status === 429 
          ? ErrorCode.RATE_LIMIT_EXCEEDED 
          : ErrorCode.QUESTION_GENERATION_ERROR,
      };
      
      throw error;
    }

    const data = await response.json();
    return data as GameQuestion;
  } catch (error) {
    // Parse error into AppError
    const appError = parseError(error);
    console.error('Failed to fetch game question:', appError);
    throw appError;
  }
}

/**
 * Get the AppError from an unknown error
 */
export function getGameError(error: unknown): AppError {
  return parseError(error);
}

