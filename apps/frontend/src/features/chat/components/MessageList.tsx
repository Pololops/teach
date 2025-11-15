import { useEffect, useRef } from 'react';
import type { Message } from '@teach/shared';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useUIStore } from '@/shared/stores/uiStore';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
}

export function MessageList({ messages, streamingContent }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping } = useUIStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 && !streamingContent && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-2">Type a message below to begin practicing English</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {streamingContent && (
        <div className="flex w-full mb-4 justify-start">
          <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted text-foreground">
            <p className="text-sm whitespace-pre-wrap break-words">{streamingContent}</p>
          </div>
        </div>
      )}

      {isTyping && !streamingContent && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
