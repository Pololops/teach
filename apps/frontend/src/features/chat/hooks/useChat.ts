import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChatMessage, CEFRLevel, MessageRole } from '@teach/shared';
import { streamChatResponse } from '@/shared/services/chatService';
import { addMessage } from '@/shared/lib/storage/entities/message';
import { useUIStore } from '@/shared/stores/uiStore';

interface UseChatOptions {
  conversationId: string;
  targetLevel: CEFRLevel;
  onMessageAdded?: (message: ChatMessage) => void;
}

interface SendMessageOptions {
  content: string;
  role?: MessageRole;
}

export function useChat({ conversationId, targetLevel, onMessageAdded }: UseChatOptions) {
  const [streamingContent, setStreamingContent] = useState('');
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const { setTyping } = useUIStore();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, role = 'user' }: SendMessageOptions) => {
      // Add user message to IndexedDB
      const userMessage = await addMessage(conversationId, role, content);
      onMessageAdded?.(userMessage);

      // Get conversation history for context
      const messages: ChatMessage[] = [{ role, content }];

      // Stream AI response
      let fullResponse = '';
      setStreamingContent('');
      setTyping(true);

      await streamChatResponse({
        messages,
        targetLevel,
        onStart: (provider) => {
          setCurrentProvider(provider);
        },
        onChunk: (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        onComplete: async () => {
          // Save complete AI response to IndexedDB
          const assistantMessage = await addMessage(
            conversationId,
            'assistant',
            fullResponse
          );
          onMessageAdded?.(assistantMessage);

          // Reset streaming state
          setStreamingContent('');
          setCurrentProvider(null);
          setTyping(false);
        },
        onError: (error) => {
          console.error('Chat stream error:', error);
          setStreamingContent('');
          setCurrentProvider(null);
          setTyping(false);
        },
      });

      return userMessage;
    },
  });

  const sendMessage = useCallback(
    (content: string, role: MessageRole = 'user') => {
      return sendMessageMutation.mutateAsync({ content, role });
    },
    [sendMessageMutation]
  );

  return {
    sendMessage,
    streamingContent,
    currentProvider,
    isStreaming: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
