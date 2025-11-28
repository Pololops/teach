import { useState } from 'react';
import type { CEFRLevel } from '@teach/shared';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
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
  const { currentUser, updateLevel } = useUserStore();
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(
    currentUser?.currentLevel || 'B1'
  );

  // Level detection
  const { analyzeMessage } = useLevelDetection({
    userId: currentUser?.id || '',
    currentLevel: targetLevel,
    onLevelChange: async (newLevel, confidence) => {
      console.log(`Niveau changé pour ${newLevel} (confiance: ${confidence})`);
      setTargetLevel(newLevel);
      if (currentUser) {
        await updateLevel(newLevel);
      }
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
    append,
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

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background px-4 py-3">
        <h2 className="text-lg font-semibold">Conversation</h2>
        <p className="text-xs text-muted-foreground">Niveau: {targetLevel}</p>
      </div>

      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        onSendPrompt={handlePromptClick}
      />

      <form onSubmit={handleSubmit} className="border-t border-border bg-background px-4 py-3">
        <MessageInput
          value={input}
          onChange={handleInputChange}
          isGenerating={isLoading}
          placeholder="Tapez votre message en anglais..."
        />
      </form>
    </div>
  );
}
