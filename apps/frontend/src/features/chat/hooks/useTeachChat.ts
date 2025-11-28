import { useState, useCallback, useMemo, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CEFRLevel, MessageRole } from '@teach/shared';
import { streamChatResponse } from '@/shared/services/chatService';
import { addMessage } from '@/shared/lib/storage/entities/message';
import { useUIStore } from '@/shared/stores/uiStore';
import { useMessages } from './useMessages';
import { toShadcnMessages, type ShadcnMessage } from '../adapters/messageAdapter';

/**
 * Options for useTeachChat hook
 */
export interface UseTeachChatOptions {
  /** Conversation ID for message persistence */
  conversationId: string;
  /** CEFR level for AI responses */
  targetLevel: CEFRLevel;
  /** Callback after assistant message is added */
  onFinish?: (message: ShadcnMessage) => void;
  /** Callback after user message is added */
  onUserMessage?: (message: ShadcnMessage) => void;
  /** Callback after any message is added (for backward compatibility) */
  onMessageAdded?: (message: { role: MessageRole; content: string }) => void;
}

/**
 * Custom chat hook matching Vercel AI SDK's useChat interface
 * Wraps existing chatService and IndexedDB integration
 */
export function useTeachChat({
  conversationId,
  targetLevel,
  onFinish,
  onUserMessage,
  onMessageAdded,
}: UseTeachChatOptions) {
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { setTyping } = useUIStore();
  const queryClient = useQueryClient();

  // Fetch messages from IndexedDB
  const { data: dbMessages = [], isLoading: isLoadingMessages } = useMessages(conversationId);

  // Transform messages to shadcn format
  const messages = useMemo(() => toShadcnMessages(dbMessages), [dbMessages]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  /**
   * Stop streaming
   */
  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setStreamingContent('');
    setTyping(false);
  }, [setTyping]);

  /**
   * Send a message and stream response
   */
  const sendMessage = useCallback(
    async (content: string, role: MessageRole = 'user') => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        // Add user message to IndexedDB
        const userMessage = await addMessage(conversationId, role, content);

        // Invalidate query to refetch messages
        await queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

        // Call callbacks
        if (onUserMessage) {
          onUserMessage({
            id: userMessage.id,
            role: userMessage.role === 'system' ? 'assistant' : userMessage.role,
            content: userMessage.content,
            createdAt: new Date(userMessage.timestamp),
          });
        }
        if (onMessageAdded) {
          onMessageAdded({ role: userMessage.role, content: userMessage.content });
        }

        // Stream AI response
        let fullResponse = '';
        setStreamingContent('');
        setTyping(true);

        await streamChatResponse({
          messages: [{ role, content }],
          targetLevel,
          onStart: () => {
            // Response started
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

            // Invalidate query to refetch messages
            await queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

            // Call finish callback
            if (onFinish) {
              onFinish({
                id: assistantMessage.id,
                role: 'assistant',
                content: assistantMessage.content,
                createdAt: new Date(assistantMessage.timestamp),
              });
            }

            // Reset streaming state
            setStreamingContent('');
            setTyping(false);
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onError: (error) => {
            console.error('Chat stream error:', error);
            setStreamingContent('');
            setTyping(false);
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
        setStreamingContent('');
        setTyping(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId, targetLevel, isLoading, setTyping, queryClient, onFinish, onUserMessage, onMessageAdded]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const messageContent = input;
      setInput(''); // Clear input immediately

      sendMessage(messageContent, 'user');
    },
    [input, sendMessage]
  );

  /**
   * Append a message programmatically (for suggestions, etc.)
   */
  const append = useCallback(
    (message: { role: 'user' | 'assistant'; content: string }) => {
      sendMessage(message.content, message.role);
    },
    [sendMessage]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || isLoadingMessages,
    streamingContent,
    stop,
    append,
  };
}
