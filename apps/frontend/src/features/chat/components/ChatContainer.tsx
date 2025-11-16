import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CEFRLevel } from '@teach/shared';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { useChat } from '../hooks/useChat';
import { useLevelDetection } from '../../level-detection/hooks/useLevelDetection';
import { useUserStore } from '@/shared/stores/userStore';

interface ChatContainerProps {
  conversationId: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, error } = useMessages(conversationId);
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

  const { sendMessage, streamingContent, isStreaming } = useChat({
    conversationId,
    targetLevel,
    onMessageAdded: async (message) => {
      // Analyze user messages for level detection
      if (message.role === 'user') {
        await analyzeMessage(message.content);
      }
      // Invalidate messages query to refetch with new message
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement de la conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Erreur lors du chargement des messages: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background px-4 py-3">
        <h2 className="text-lg font-semibold">Conversation</h2>
        <p className="text-xs text-muted-foreground">Niveau: {targetLevel}</p>
      </div>

      <MessageList messages={messages} streamingContent={streamingContent} />

      <MessageInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder="Tapez votre message en anglais..."
      />
    </div>
  );
}
