import { motion } from 'framer-motion';
import { splitEmojis } from '@/shared/lib/emojiUtils';

interface EmojiDisplayProps {
  emoji: string;
  shake?: boolean;
}

const SIZE_BY_COUNT: Record<number, string> = {
  1: 'text-[120px] md:text-[160px]',
  2: 'text-[90px] md:text-[120px]',
  3: 'text-[70px] md:text-[100px]',
};

/**
 * Large centered emoji display with shake animation on wrong answer.
 * Supports 1-3 emoji combinations with scaled font sizes.
 */
export function EmojiDisplay({ emoji, shake }: EmojiDisplayProps) {
  const emojis = splitEmojis(emoji);
  const sizeClass = SIZE_BY_COUNT[emojis.length] ?? SIZE_BY_COUNT[3];

  return (
    <motion.div
      className="flex items-center justify-center gap-2"
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {emojis.map((e, i) => (
        <span key={i} className={`${sizeClass} select-none`} role="img" aria-label="emoji">
          {e}
        </span>
      ))}
    </motion.div>
  );
}

