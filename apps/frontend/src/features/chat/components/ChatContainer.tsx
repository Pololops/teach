import { useState } from 'react';
import type { CEFRLevel, ErrorAction } from '@teach/shared';
import { SectionLayout } from '@/components/ui/section-layout';
import { MessageList } from './MessageList';
import { MessageInput } from '@/components/ui/message-input';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useMessages } from '../hooks/useMessages';
import { useTeachChat } from '../hooks/useTeachChat';
import { useLevelDetection } from '../../level-detection/hooks/useLevelDetection';
import { useUserStore } from '@/shared/stores/userStore';

interface ChatContainerProps {
  conversationId: string;
}

/**
 * ChatContainer - Main chat interface using shadcn-chatbot-kit components
 *
 * Features:
 * - Uses useTeachChat hook (Vercel AI SDK interface)
 * - Integrates level detection for CEFR assessment
 * - Manages conversation state and streaming
 * - Provides loading and error states
 */
export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { currentLevel, updateLevel } = useUserStore();
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(
    currentLevel || 'A1'
  );

  // Level detection
  const { analyzeMessage } = useLevelDetection({
    userId: currentLevel ? 'user-id' : '',
    currentLevel: targetLevel,
    onLevelChange: async (newLevel, confidence) => {
      console.log(`Niveau changé pour ${newLevel} (confiance: ${confidence})`);
      setTargetLevel(newLevel);
      await updateLevel(newLevel);
    },
    minConfidence: 0.7,
    minSamples: 5,
  });

  // Fetch raw messages from IndexedDB
  const { data: messages = [] } = useMessages(conversationId);

  // Use the unified chat hook for input/submit handling
  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    streamingContent,
    error,
    contextStats,
    append,
    clearError,
  } = useTeachChat({
    conversationId,
    targetLevel,
    onMessageAdded: async (message) => {
      // Analyze user messages for level detection
      if (message.role === 'user') {
        await analyzeMessage(message.content);
      }
    },
  });

  // Handle prompt suggestion clicks
  const handlePromptClick = async (content: string) => {
    await append({ role: 'user', content });
  };

  // Handle error actions
  const handleErrorAction = (action: ErrorAction) => {
    switch (action.action) {
      case 'retry':
        // Retry by resubmitting the last message
        clearError();
        break;
      case 'dismiss':
        clearError();
        break;
      case 'wait':
        // User acknowledges wait time
        setTimeout(() => {
          clearError();
        }, 2000);
        break;
      case 'contact':
        window.location.href = 'mailto:support@teach.app?subject=Chat Error';
        break;
      default:
        clearError();
        break;
    }
  };

  return (
    <SectionLayout
      title="Conversation"
      subtitle={<p className="text-xs text-muted-foreground">Niveau: {targetLevel}</p>}
      rightContent={
        contextStats && contextStats.truncated ? (
          <div className="text-xs text-muted-foreground">
            <span title={`Total: ${contextStats.totalMessages} messages | Tokens: ~${contextStats.estimatedTokens}`}>
              Context: {contextStats.includedMessages}/{contextStats.totalMessages} messages
            </span>
          </div>
        ) : undefined
      }
    >
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        onSendPrompt={handlePromptClick}
      />

      <form onSubmit={handleSubmit} className="border-t border-border bg-background px-4 py-3">{error && (
        <div className="mb-3">
          <ErrorDisplay error={error} onAction={handleErrorAction} />
        </div>
      )}
        <MessageInput
          isGenerating={isLoading}
          placeholder="Tapez votre message en anglais..."
          value={input}
          onChange={handleInputChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </form>
    </SectionLayout>
  );
}
