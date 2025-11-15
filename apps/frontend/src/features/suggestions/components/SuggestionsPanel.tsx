import type { Suggestion } from '@teach/shared';
import { SuggestionCard } from './SuggestionCard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 px-1">
        Learning Tips ({suggestions.length})
      </h4>
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </div>
  );
}
