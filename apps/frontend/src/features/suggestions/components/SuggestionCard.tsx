import type { Suggestion } from '@teach/shared';
import { cn } from '@/shared/lib/utils';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const typeColors = {
    vocabulary: 'bg-purple-50 border-purple-300 text-purple-900',
    phrase: 'bg-green-50 border-green-300 text-green-900',
    response: 'bg-blue-50 border-blue-300 text-blue-900',
    question: 'bg-orange-50 border-orange-300 text-orange-900',
  };

  const typeIcons = {
    vocabulary: '📚',
    phrase: '💬',
    response: '✍️',
    question: '❓',
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        typeColors[suggestion.type]
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[suggestion.type]}</span>
          <span className="text-xs font-semibold uppercase">
            {suggestion.type}
          </span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-white/50 rounded">
          {suggestion.level}
        </span>
      </div>

      <p className="text-sm font-medium mb-1">{suggestion.text}</p>
      <p className="text-xs leading-relaxed opacity-90">{suggestion.context}</p>
    </div>
  );
}
