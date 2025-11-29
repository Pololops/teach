import { useMemo, useState } from 'react';
import { ChatMessage } from '@/components/ui/chat-message';
import { CorrectionDisplay } from './CorrectionDisplay';
import { parseTextSegments } from '../utils/correctionUtils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { MessageMetadata, AICorrection } from '@teach/shared';

export interface TeachChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  metadata?: MessageMetadata;
}

/**
 * MessageBubbleWithHighlights - Custom message bubble with error highlights
 */
function MessageBubbleWithHighlights({
  content,
  changes,
  createdAt,
  showTimeStamp
}: {
  content: string;
  changes: AICorrection['changes'];
  createdAt?: Date;
  showTimeStamp?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const segments = useMemo(
    () => parseTextSegments(content, changes),
    [content, changes]
  );

  const sortedChanges = useMemo(
    () => [...changes].sort((a, b) => a.start - b.start),
    [changes]
  );

  const formattedTime = createdAt?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col items-end group/message relative wrap-break-word text-sm sm:max-w-[70%]">
      {/* Message bubble */}
      <div className="rounded-lg p-3 bg-primary text-primary-foreground duration-300 animate-in fade-in-0 zoom-in-75 origin-bottom-right">
        {segments.map((segment, index) => {
          if (segment.hasError && segment.changeIndex !== undefined) {
            const change = sortedChanges[segment.changeIndex];
            return (
              <Popover
                key={index}
                open={hoveredIndex === index}
                onOpenChange={(open) => setHoveredIndex(open ? index : null)}
              >
                <PopoverTrigger asChild>
                  <span
                    className="border-b-2 border-dotted border-destructive! pb-px cursor-help"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {segment.text}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-xs shadow-lg" side="top" align="start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        {change.type === 'grammar' ? 'grammaire' :
                         change.type === 'spelling' ? 'orthographe' :
                         change.type === 'vocabulary' ? 'vocabulaire' :
                         change.type === 'conjugation' ? 'conjugaison' :
                         change.type}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Original :</span>{' '}
                        <span className="line-through text-muted-foreground">{change.original}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Correction :</span>{' '}
                        <span className="text-green-600 font-medium">{change.corrected}</span>
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return <span key={index}>{segment.text}</span>;
        })}
      </div>

      {showTimeStamp && createdAt ? (
        <time
          dateTime={createdAt.toISOString()}
          className="block text-xs opacity-50 duration-500 animate-in fade-in-0"
        >
          {formattedTime}
        </time>
      ) : null}
    </div>
  );
}

/**
 * TeachChatMessage - Enhanced ChatMessage with AI-driven corrections
 *
 * Shows:
 * - Red dotted underlines on errors in the original message bubble
 * - Corrected text displayed below in subtle styling
 */
export function TeachChatMessage({
  id,
  role,
  content,
  createdAt,
  metadata,
}: TeachChatMessageProps) {
  // Show AI corrections only for user messages when available
  const hasCorrection = role === 'user' && metadata?.aiCorrection;

  // For messages with corrections, we render a custom bubble with integrated correction display
  if (hasCorrection && metadata?.aiCorrection) {
    const formattedTime = createdAt?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="flex flex-col items-end">
        {/* Custom message bubble with highlights */}
        <MessageBubbleWithHighlights
          content={content}
          changes={metadata.aiCorrection.changes}
          createdAt={undefined}
          showTimeStamp={false}
        />

        {/* Corrected message - between bubble and timestamp */}
        <div className="max-w-max">
          <CorrectionDisplay
            originalText={content}
            aiCorrection={metadata.aiCorrection}
          />
        </div>

        {/* Timestamp */}
        {createdAt && (
          <time
            dateTime={createdAt.toISOString()}
            className="block px-1 text-xs opacity-50 duration-500 animate-in fade-in-0"
          >
            {formattedTime}
          </time>
        )}
      </div>
    );
  }

  // Regular message without corrections
  return (
    <ChatMessage
      id={id}
      role={role}
      content={content}
      createdAt={createdAt}
      showTimeStamp={true}
      animation="scale"
    />
  );
}
