import { useEffect, useState } from 'react';
import type { Conversation } from '@teach/shared';
import { createConversation, getConversations } from '@/shared/lib/storage/entities/conversation';
import { getUser } from '@/shared/lib/storage/entities/user';

export function useConversation() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initConversation() {
      try {
        // Get or create user
        const user = await getUser();

        // Get active conversations
        const conversations = await getConversations(user.id, 'active');

        // Use existing conversation or create new one
        if (conversations.length > 0) {
          setConversation(conversations[0]);
        } else {
          const newConv = await createConversation(
            user.id,
            'Practice Chat',
            user.currentLevel
          );
          setConversation(newConv);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize conversation'));
      } finally {
        setIsLoading(false);
      }
    }

    initConversation();
  }, []);

  return { conversation, isLoading, error };
}
