import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultOverlayProps {
  result: 'correct' | 'wrong';
  show: boolean;
}

/**
 * Fullscreen overlay showing success or failure icon
 * Displays for 3 seconds after correct answer or max attempts
 */
export function ResultOverlay({ result, show }: ResultOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        >
          {result === 'correct' ? (
            <CheckCircle2 className="w-32 h-32 text-green-500" strokeWidth={2} />
          ) : (
            <XCircle className="w-32 h-32 text-red-500" strokeWidth={2} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

