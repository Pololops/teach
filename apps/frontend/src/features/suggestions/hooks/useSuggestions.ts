import { useMemo } from 'react';
import type { Suggestion, CEFRLevel } from '@teach/shared';
import { suggestionsAnalyzer } from '../lib/suggestionsAnalyzer';

interface UseSuggestionsOptions {
  text: string;
  level: CEFRLevel;
  enabled?: boolean;
}

export function useSuggestions({ text, level, enabled = true }: UseSuggestionsOptions) {
  const suggestions = useMemo(() => {
    if (!enabled || !text.trim()) return [];
    return suggestionsAnalyzer.analyze(text, level);
  }, [text, level, enabled]);

  const suggestionsByType = useMemo(() => {
    const grouped: Record<string, Suggestion[]> = {
      vocabulary: [],
      phrase: [],
      response: [],
      question: [],
    };

    suggestions.forEach((suggestion) => {
      grouped[suggestion.type].push(suggestion);
    });

    return grouped;
  }, [suggestions]);

  return {
    suggestions,
    suggestionsByType,
    count: suggestions.length,
  };
}
