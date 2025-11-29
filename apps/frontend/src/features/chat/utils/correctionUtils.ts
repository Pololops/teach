import type { AICorrection } from '@teach/shared';

interface TextSegment {
  text: string;
  hasError: boolean;
  changeIndex?: number;
}

/**
 * Parse text into segments with error positions
 * Used to highlight errors in message text
 */
export function parseTextSegments(
  originalText: string,
  changes: AICorrection['changes']
): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastEnd = 0;

  // Sort changes by start position
  const sortedChanges = [...changes].sort((a, b) => a.start - b.start);

  sortedChanges.forEach((change, index) => {
    // Add normal text before this change
    if (change.start > lastEnd) {
      segments.push({
        text: originalText.slice(lastEnd, change.start),
        hasError: false,
      });
    }

    // Add error text
    segments.push({
      text: originalText.slice(change.start, change.end),
      hasError: true,
      changeIndex: index,
    });

    lastEnd = change.end;
  });

  // Add remaining normal text
  if (lastEnd < originalText.length) {
    segments.push({
      text: originalText.slice(lastEnd),
      hasError: false,
    });
  }

  return segments;
}
