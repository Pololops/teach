import type { AICorrection } from '@teach/shared';

interface TextSegment {
  text: string;
  hasError: boolean;
  changeIndex?: number;
}

/**
 * Parse text into segments with error positions
 * Used to highlight errors in message text
 * 
 * Note: Positions are now calculated accurately by the backend using diff algorithm,
 * so we trust them directly with basic validation.
 */
export function parseTextSegments(
  originalText: string,
  changes: AICorrection['changes']
): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastEnd = 0;

  // Filter out invalid positions (basic sanity check)
  const validChanges = changes.filter((change: AICorrection['changes'][number]) => {
    const isValid =
      change.start >= 0 &&
      change.end <= originalText.length &&
      change.start <= change.end;

    if (!isValid) {
      console.warn(
        `Skipping invalid correction position: start=${change.start}, end=${change.end}`,
        { textLength: originalText.length, change }
      );
    }

    return isValid;
  });

  // Sort changes by start position
  const sortedChanges = [...validChanges].sort((a, b) => a.start - b.start);

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
