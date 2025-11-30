import type { AICorrection } from '@teach/shared';

interface TextSegment {
  text: string;
  hasError: boolean;
  changeIndex?: number;
}

/**
 * Find the actual position of the original text in the message
 * Searches near the AI's suggested position for better accuracy
 * Returns null if the text cannot be found
 */
function findActualPosition(
  text: string,
  original: string,
  suggestedStart: number,
  searchWindow: number = 20
): { start: number; end: number } | null {
  // First, try exact match at suggested position
  const exactMatch = text.slice(suggestedStart, suggestedStart + original.length);
  if (exactMatch === original) {
    return { start: suggestedStart, end: suggestedStart + original.length };
  }

  // Search in a window around the suggested position (case-sensitive first)
  const windowStart = Math.max(0, suggestedStart - searchWindow);
  const windowEnd = Math.min(text.length, suggestedStart + original.length + searchWindow);
  const searchArea = text.slice(windowStart, windowEnd);

  const index = searchArea.indexOf(original);
  if (index !== -1) {
    const actualStart = windowStart + index;
    return { start: actualStart, end: actualStart + original.length };
  }

  // Try case-insensitive search as fallback
  const lowerOriginal = original.toLowerCase();
  const lowerSearchArea = searchArea.toLowerCase();
  const lowerIndex = lowerSearchArea.indexOf(lowerOriginal);

  if (lowerIndex !== -1) {
    const actualStart = windowStart + lowerIndex;
    return { start: actualStart, end: actualStart + original.length };
  }

  // Not found - return null to skip this correction
  return null;
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

  // Create a verified changes array - only include changes we can accurately locate
  const verifiedChanges = changes
    .map((change, originalIndex) => {
      const actualPosition = findActualPosition(
        originalText,
        change.original,
        change.start
      );

      if (!actualPosition) {
        // Skip this change - we couldn't find the original text
        console.warn(
          `Skipping correction: Could not find "${change.original}" in message`,
          { suggestedStart: change.start, message: originalText }
        );
        return null;
      }

      return {
        ...change,
        start: actualPosition.start,
        end: actualPosition.end,
        originalIndex, // Keep track of original index for looking up in TeachChatMessage
      };
    })
    .filter((change): change is NonNullable<typeof change> => change !== null);

  // Sort changes by start position
  const sortedChanges = [...verifiedChanges].sort((a, b) => a.start - b.start);

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
