import { ChatContainer } from './features/chat/components/ChatContainer';
import { GameContainer } from './features/game/components/GameContainer';
import { HomeScreen } from './features/home/components/HomeScreen';
import { useConversation } from './features/chat/hooks/useConversation';
import { useNavigationStore } from './shared/stores/navigationStore';

function App() {
  const { conversation, isLoading, error } = useConversation();
  const { currentScreen } = useNavigationStore();

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

  // Render screen based on navigation state
  switch (currentScreen) {
    case 'chat':
      return (
        <div className="h-screen bg-background text-foreground">
          <ChatContainer conversationId={conversation.id} />
        </div>
      );
    case 'game':
      return <GameContainer />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

export default App;
