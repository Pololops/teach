import { ChatMessage } from '@/components/ui/chat-message';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCorrections } from '@/features/corrections/hooks/useCorrections';
import { useSuggestions } from '@/features/suggestions/hooks/useSuggestions';
import { CorrectionsPanel } from '@/features/corrections/components/CorrectionsPanel';
import { SuggestionsPanel } from '@/features/suggestions/components/SuggestionsPanel';
import { useUserStore } from '@/shared/stores/userStore';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { CEFRLevel } from '@teach/shared';

export interface TeachChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  showFeedback?: boolean;
}

/**
 * TeachChatMessage - Enhanced ChatMessage with corrections and suggestions
 *
 * Wraps shadcn-chatbot-kit ChatMessage and adds:
 * - Grammar/spelling corrections for user messages
 * - Contextual suggestions for learning
 * - Collapsible feedback panel
 */
export function TeachChatMessage({
  id,
  role,
  content,
  createdAt,
  showFeedback = true
}: TeachChatMessageProps) {
  const { currentLevel } = useUserStore();

  // Only analyze user messages for feedback
  const { corrections } = useCorrections({
    text: content,
    enabled: role === 'user' && showFeedback
  });

  const { suggestions } = useSuggestions({
    text: content,
    level: (currentLevel as CEFRLevel) || 'A1',
    enabled: role === 'user' && showFeedback
  });

  const hasFeedback = role === 'user' && showFeedback && (corrections.length > 0 || suggestions.length > 0);

  return (
    <div className="space-y-2">
      <ChatMessage
        id={id}
        role={role}
        content={content}
        createdAt={createdAt}
        showTimeStamp={true}
        animation="scale"
      />

      {hasFeedback && (
        <Collapsible className="ml-12">
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRightIcon className="h-4 w-4 transition-transform [[data-state=open]>&]:rotate-90" />
            Voir les suggestions ({corrections.length + suggestions.length})
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-3">
            {corrections.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Corrections</h4>
                <CorrectionsPanel corrections={corrections} text={content} />
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Suggestions</h4>
                <SuggestionsPanel suggestions={suggestions} />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
