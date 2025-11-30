import { useEffect, useRef } from 'react';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { PromptSuggestions } from '@/components/ui/prompt-suggestions';
import { TeachChatMessage } from './TeachChatMessage';
import { useUIStore } from '@/shared/stores/uiStore';
import { toShadcnMessages, type ShadcnMessage } from '../adapters/messageAdapter';
import type { Message, AppError, ErrorAction } from '@teach/shared';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  error?: AppError | null;
  onErrorAction?: (action: ErrorAction) => void;
  onSendPrompt?: (content: string) => void;
}

/**
 * MessageList - Custom message list with TeachChatMessage rendering
 *
 * Features:
 * - Renders each message with TeachChatMessage (includes feedback)
 * - Auto-scrolls to newest messages
 * - Shows typing indicator and streaming content
 * - Shows prompt suggestions in empty state
 * - Uses shadcn spacing and structure
 */
export function MessageList({ messages, streamingContent, error, onErrorAction, onSendPrompt }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping } = useUIStore();

  // Convert to shadcn format
  const shadcnMessages: ShadcnMessage[] = toShadcnMessages(messages);

  // Add streaming message if active
  const displayMessages = streamingContent
    ? [
      ...shadcnMessages,
      {
        id: 'streaming',
        role: 'assistant' as const,
        content: streamingContent,
        createdAt: new Date(),
      },
    ]
    : shadcnMessages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Starter prompts for empty state
  const starterPrompts = [
    "Let's talk about my hobbies",
    "I want to practice ordering food",
    "Help me prepare for a job interview",
    "Let's discuss current events"
  ];

  const handlePromptClick = (content: string) => {
    if (onSendPrompt) {
      onSendPrompt(content);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <PromptSuggestions
            label="Commencez une conversation"
            append={({ content }) => handlePromptClick(content)}
            suggestions={starterPrompts}
          />
        </div>
      ) : (
        <div className="space-y-4 overflow-visible">
          {displayMessages.map((message) => (
            <TeachChatMessage
              key={message.id}
              id={message.id}
              role={message.role}
              content={message.content}
              createdAt={message.createdAt}
              metadata={message.metadata}
            />
          ))}
          {isTyping && !streamingContent && !error && <TypingIndicator />}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
