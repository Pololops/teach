import type { Suggestion, CEFRLevel } from '@teach/shared';

/**
 * Contextual learning suggestions analyzer
 * Provides helpful tips based on CEFR level and message content
 */
export class SuggestionsAnalyzer {
  /**
   * Analyze text and provide learning suggestions
   */
  analyze(text: string, level: CEFRLevel): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Generate contextual suggestions based on level
    suggestions.push(...this.getVocabularySuggestions(text, level));
    suggestions.push(...this.getPhraseSuggestions(text, level));
    suggestions.push(...this.getResponseSuggestions(text, level));

    // Limit to top 3
    return suggestions.slice(0, 3);
  }

  /**
   * Get vocabulary suggestions
   */
  private getVocabularySuggestions(_text: string, level: CEFRLevel): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Level-specific vocabulary suggestions
    if (level === 'A1' || level === 'A2') {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'vocabulary',
        text: 'family',
        context: 'Try using this word to talk about your relatives',
        level,
      });
    } else if (level === 'B1' || level === 'B2') {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'vocabulary',
        text: 'although',
        context: 'Use "although" to show contrast between two ideas',
        level,
      });
    }

    return suggestions.slice(0, 1);
  }

  /**
   * Get phrase suggestions
   */
  private getPhraseSuggestions(_text: string, level: CEFRLevel): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (level === 'A1' || level === 'A2') {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'phrase',
        text: 'How about you?',
        context: 'A friendly way to turn the question back to your conversation partner',
        level,
      });
    } else if (level === 'B1' || level === 'B2') {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'phrase',
        text: 'I would argue that...',
        context: 'Use this phrase to present your opinion in discussions',
        level,
      });
    }

    return suggestions.slice(0, 1);
  }

  /**
   * Get response suggestions
   */
  private getResponseSuggestions(text: string, level: CEFRLevel): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (text.includes('?')) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'response',
        text: 'I think...',
        context: 'Start your answer with your opinion',
        level,
      });
    } else if (text.split(/\s+/).length < 10) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'question',
        text: 'What about...?',
        context: 'Ask a follow-up question to keep the conversation going',
        level,
      });
    }

    return suggestions.slice(0, 1);
  }
}

export const suggestionsAnalyzer = new SuggestionsAnalyzer();
