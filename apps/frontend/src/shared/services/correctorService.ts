import type { CorrectMessageResponse } from '@teach/shared';

const API_BASE_URL = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:3000';

/**
 * Correct a message and return AI-driven corrections
 * Includes retry logic with exponential backoff
 */
export async function correctMessage(text: string): Promise<CorrectMessageResponse | null> {
  const maxRetries = 2;
  const retryDelays = [500, 1000]; // ms

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/correct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (typeof data.hasErrors !== 'boolean') {
        throw new Error('Invalid response structure');
      }

      return data as CorrectMessageResponse;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        console.error('Corrector service failed after retries:', error);
        // Return null on final failure (silent degradation)
        return null;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
      console.warn(`Corrector service retry ${attempt + 1}/${maxRetries}...`);
    }
  }

  return null;
}
