import { useQueryClient } from '@tanstack/react-query';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { useChat } from '../hooks/useChat';

interface ChatContainerProps {
  conversationId: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, error } = useMessages(conversationId);

  // For now, use a fixed CEFR level - will be dynamic later
  const targetLevel = 'B1';

  const { sendMessage, streamingContent, isStreaming } = useChat({
    conversationId,
    targetLevel,
    onMessageAdded: () => {
      // Invalidate messages query to refetch with new message
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading messages: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background px-4 py-3">
        <h2 className="text-lg font-semibold">Practice Chat</h2>
        <p className="text-xs text-muted-foreground">Level: {targetLevel}</p>
      </div>

      <MessageList messages={messages} streamingContent={streamingContent} />

      <MessageInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder="Type your message in English..."
      />
    </div>
  );
}
