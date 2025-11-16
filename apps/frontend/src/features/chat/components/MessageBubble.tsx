import type { Message, CEFRLevel } from '@teach/shared';
import { cn } from '@/shared/lib/utils';
import { useCorrections } from '@/features/corrections/hooks/useCorrections';
import { useSuggestions } from '@/features/suggestions/hooks/useSuggestions';
import { CorrectionsPanel } from '@/features/corrections/components/CorrectionsPanel';
import { SuggestionsPanel } from '@/features/suggestions/components/SuggestionsPanel';
import { useUserStore } from '@/shared/stores/userStore';

interface MessageBubbleProps {
  message: Message;
  showFeedback?: boolean;
}

export function MessageBubble({ message, showFeedback = true }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { currentUser } = useUserStore();
  const currentLevel = (currentUser?.currentLevel || 'B1') as CEFRLevel;

  // Analyze user messages for corrections and suggestions
  const { corrections } = useCorrections({
    text: message.content,
    enabled: isUser && showFeedback && currentUser?.preferences.showCorrections !== false,
  });

  const { suggestions } = useSuggestions({
    text: message.content,
    level: currentLevel,
    enabled: isUser && showFeedback && currentUser?.preferences.showSuggestions !== false,
  });

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn('max-w-[70%]', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground shadow-lg rounded-br-none'
              : 'bg-muted text-muted-foreground shadow-lg rounded-bl-none'
          )}
        >
          <p className="text-sm whitespace-pre-wrap wrap-break-words">{message.content}</p>
        </div>
        <span className="text-[0.6rem] text-right opacity-60 mt-1 mx-2 block">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        {/* Show corrections and suggestions for user messages */}
        {isUser && showFeedback && (
          <div className="w-full mt-2">
            <CorrectionsPanel text={message.content} corrections={corrections} />
            <SuggestionsPanel suggestions={suggestions} />
          </div>
        )}
      </div>
    </div>
  );
}
