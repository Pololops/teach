import { motion } from 'framer-motion';

interface EmojiDisplayProps {
  emoji: string;
  shake?: boolean;
}

/**
 * Large centered emoji display with shake animation on wrong answer
 */
export function EmojiDisplay({ emoji, shake }: EmojiDisplayProps) {
  return (
    <motion.div
      className="flex items-center justify-center"
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="text-[120px] md:text-[160px] select-none" role="img" aria-label="emoji">
        {emoji}
      </div>
    </motion.div>
  );
}

