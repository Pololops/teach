import diff from 'fast-diff';

/**
 * Correction change with position information
 */
interface CorrectionChange {
  start: number;
  end: number;
  original: string;
  corrected: string;
  explanation: string;
}

/**
 * Calculate accurate positions for text corrections using diff algorithm
 * 
 * @param originalText - The original text with errors
 * @param correctedText - The corrected text
 * @returns Array of correction changes with accurate start/end positions
 */
export function calculatePositions(
  originalText: string,
  correctedText: string
): CorrectionChange[] {
  // Run character-level diff
  const diffs = diff(originalText, correctedText);

  const rawChanges: Array<{
    start: number;
    end: number;
    original: string;
    corrected: string;
  }> = [];

  let originalPosition = 0;
  let correctedPosition = 0;

  // First pass: collect all changes with positions, tracking both original and corrected positions
  for (let i = 0; i < diffs.length; i++) {
    const [operation, text] = diffs[i];

    if (operation === diff.DELETE) {
      // Text was removed or changed
      const start = originalPosition;
      const end = originalPosition + text.length;

      // Look ahead to see if there's a corresponding INSERT (replacement)
      const nextDiff = i + 1 < diffs.length ? diffs[i + 1] : null;

      if (nextDiff && nextDiff[0] === diff.INSERT) {
        // This is a replacement
        rawChanges.push({
          start,
          end,
          original: text,
          corrected: nextDiff[1],
        });
        // Skip the INSERT on next iteration since we already processed it
        correctedPosition += nextDiff[1].length;
        i++;
      } else {
        // This is a deletion (word removed)
        rawChanges.push({
          start,
          end,
          original: text,
          corrected: '',
        });
      }

      originalPosition += text.length;
    } else if (operation === diff.INSERT) {
      // Text was added (pure insertion, not part of replacement)
      rawChanges.push({
        start: originalPosition,
        end: originalPosition,
        original: '',
        corrected: text,
      });
      correctedPosition += text.length;
      // Don't update originalPosition for inserts (they don't exist in original)
    } else {
      // EQUAL - text unchanged
      originalPosition += text.length;
      correctedPosition += text.length;
    }
  }

  // Second pass: merge nearby changes into word-level corrections
  const mergedChanges = mergeNearbyChanges(rawChanges, originalText);

  // Third pass: expand to full word boundaries
  const expandedChanges = mergedChanges.map(change =>
    expandToWordBoundariesWithCorrection(change, originalText, correctedText)
  );

  // Fourth pass: add default explanation (will be replaced by AI hints if available)
  return expandedChanges.map(change => ({
    ...change,
    explanation: '', // Default empty, will be filled by AI hints
  }));
}

/**
 * Merge nearby changes that are part of the same word or phrase
 * This prevents highlighting individual characters when a whole word changed
 */
function mergeNearbyChanges(
  changes: Array<{ start: number; end: number; original: string; corrected: string }>,
  originalText: string
): Array<{ start: number; end: number; original: string; corrected: string }> {
  if (changes.length === 0) return [];

  const merged: Array<{ start: number; end: number; original: string; corrected: string }> = [];
  let current = { ...changes[0] };

  for (let i = 1; i < changes.length; i++) {
    const next = changes[i];
    const gap = next.start - current.end;

    // If changes are very close (within 3 chars) and in the same word, merge them
    if (gap <= 3 && !hasWordBoundaryBetween(originalText, current.end, next.start)) {
      // Merge the changes
      current = {
        start: current.start,
        end: next.end,
        original: originalText.slice(current.start, next.end),
        corrected: current.corrected + originalText.slice(current.end, next.start) + next.corrected,
      };
    } else {
      // Push current and start new
      merged.push(current);
      current = { ...next };
    }
  }

  // Push the last one
  merged.push(current);

  return merged;
}

/**
 * Check if there's a word boundary (space, punctuation) between two positions
 */
function hasWordBoundaryBetween(text: string, start: number, end: number): boolean {
  const between = text.slice(start, end);
  return /[\s,.!?;:]/.test(between);
}

/**
 * Expand a change to cover full word boundaries
 * When expanding, preserve the corrected text that was already captured from the diff
 */
function expandToWordBoundariesWithCorrection(
  change: { start: number; end: number; original: string; corrected: string },
  originalText: string,
  _correctedText: string
): { start: number; end: number; original: string; corrected: string } {
  // Skip insertions (they have no original text to expand)
  if (change.start === change.end) {
    return change;
  }

  let newStart = change.start;
  let newEnd = change.end;

  // Expand backward to start of word
  while (newStart > 0 && !isWordBoundary(originalText[newStart - 1])) {
    newStart--;
  }

  // Expand forward to end of word
  while (newEnd < originalText.length && !isWordBoundary(originalText[newEnd])) {
    newEnd++;
  }

  // If we expanded the boundaries, we need to update both original and corrected
  if (newStart !== change.start || newEnd !== change.end) {
    const expandedOriginal = originalText.slice(newStart, newEnd);

    // For the corrected text, we need to include any parts that weren't changed
    // Get the prefix (from newStart to change.start)
    const unchangedPrefix = originalText.slice(newStart, change.start);
    // Get the suffix (from change.end to newEnd)
    const unchangedSuffix = originalText.slice(change.end, newEnd);

    // Build the corrected text: unchanged prefix + corrected middle + unchanged suffix
    const expandedCorrected = unchangedPrefix + change.corrected + unchangedSuffix;

    return {
      start: newStart,
      end: newEnd,
      original: expandedOriginal,
      corrected: expandedCorrected,
    };
  }

  return change;
}

/**
 * Check if a character is a word boundary (space, punctuation, etc.)
 */
function isWordBoundary(char: string): boolean {
  return /[\s,.!?;:'"()\-]/.test(char);
}

