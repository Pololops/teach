import type { AICorrection } from '@teach/shared';

export interface CorrectionDisplayProps {
  originalText: string;
  aiCorrection: AICorrection;
}

/**
 * CorrectionDisplay - Shows only the corrected text
 *
 * Displays the corrected version in subtle styling below the original message
 */
export function CorrectionDisplay({ aiCorrection }: CorrectionDisplayProps) {
  return (
    <div className="border-l-2 border-green-500 pl-3 py-1">
      <div className="text-xs italic text-gray-500">
        {aiCorrection.correctedText}
      </div>
    </div>
  );
}
