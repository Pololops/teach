import { ChatContainer } from './features/chat/components/ChatContainer';
import { useConversation } from './features/chat/hooks/useConversation';

function App() {
  const { conversation, isLoading, error } = useConversation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Initializing Teach...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-red-500">
          Error: {error?.message || 'Failed to load conversation'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground">
      <ChatContainer conversationId={conversation.id} />
    </div>
  );
}

export default App;
