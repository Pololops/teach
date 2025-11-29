/**
 * Emoji detection and normalization utilities
 *
 * Provides functions to detect emoji-only messages and normalize spacing
 * for enhanced chat message rendering.
 */

/**
 * Detects if a string contains only emojis and whitespace
 * Uses Unicode property escapes to match emoji characters including:
 * - Standard emojis
 * - Emoji modifiers (skin tones, gender, etc.)
 * - Zero-width joiners (ZWJ) for complex emoji sequences
 * - Emoji components
 *
 * @param text - The text to check
 * @returns true if the text contains only emojis and spaces, false otherwise
 *
 * @example
 * isEmojiOnly("😀") // true
 * isEmojiOnly("😀 👋") // true
 * isEmojiOnly("hello 😀") // false
 * isEmojiOnly("😀!!!") // false
 * isEmojiOnly("   ") // false (no actual emoji)
 */
export function isEmojiOnly(text: string): boolean {
  if (!text || text.trim().length === 0) return false;

  // Regex matches emoji (including modifiers, ZWJ sequences, skin tones) and whitespace
  const emojiOnlyPattern = /^[\p{Emoji}\p{Emoji_Component}\s]+$/u;

  // Additional check: ensure at least one emoji exists (not just spaces)
  const hasEmojiPattern = /\p{Emoji}/u;

  return emojiOnlyPattern.test(text) && hasEmojiPattern.test(text);
}

/**
 * Removes all whitespace from emoji-only messages
 * Spaces between emojis will be handled by CSS gap instead
 *
 * @param text - The text to normalize
 * @returns The text with all spaces removed
 *
 * @example
 * normalizeEmojiSpacing("  😀   👋   🎉  ") // "😀👋🎉"
 * normalizeEmojiSpacing("😀     👋") // "😀👋"
 */
export function normalizeEmojiSpacing(text: string): string {
  return text.replace(/\s+/g, '');
}

/**
 * Splits emoji-only text into an array of individual emojis
 * Handles complex emojis including skin tone modifiers and ZWJ sequences
 *
 * @param text - The emoji text to split (should be normalized first)
 * @returns Array of individual emoji strings
 *
 * @example
 * splitEmojis("😀👋🎉") // ["😀", "👋", "🎉"]
 * splitEmojis("👋🏻👋🏿") // ["👋🏻", "👋🏿"]
 */
export function splitEmojis(text: string): string[] {
  // Use Intl.Segmenter for proper emoji segmentation if available
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }

  // Fallback: split by individual characters (may not handle all complex emojis perfectly)
  // This regex matches emoji sequences including modifiers and ZWJ sequences
  const emojiRegex = /\p{Emoji}(\p{Emoji_Modifier}|\uFE0F|\u200D\p{Emoji})*/gu;
  return text.match(emojiRegex) || [];
}

/**
 * Combined utility for processing emoji messages
 * Checks if a message is emoji-only and provides normalized version
 *
 * @param text - The message text to process
 * @returns Object with isEmojiOnly flag, normalized text, and emoji array
 *
 * @example
 * processEmojiMessage("😀  👋")
 * // { isEmojiOnly: true, normalized: "😀👋", emojis: ["😀", "👋"] }
 *
 * processEmojiMessage("hello 😀")
 * // { isEmojiOnly: false, normalized: "hello 😀", emojis: [] }
 */
export function processEmojiMessage(text: string): {
  isEmojiOnly: boolean;
  normalized: string;
  emojis: string[];
} {
  const emojiOnly = isEmojiOnly(text);
  const normalized = emojiOnly ? normalizeEmojiSpacing(text) : text;
  return {
    isEmojiOnly: emojiOnly,
    normalized,
    emojis: emojiOnly ? splitEmojis(normalized) : [],
  };
}
