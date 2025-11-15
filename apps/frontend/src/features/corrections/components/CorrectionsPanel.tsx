import type { Correction } from '@teach/shared';
import { CorrectionTooltip } from './CorrectionTooltip';

interface CorrectionsPanelProps {
  text: string;
  corrections: Correction[];
}

export function CorrectionsPanel({ text, corrections }: CorrectionsPanelProps) {
  if (corrections.length === 0) {
    return null;
  }

  // Sort corrections by position
  const sortedCorrections = [...corrections].sort(
    (a, b) => a.position.start - b.position.start
  );

  // Split text into segments with corrections highlighted
  const segments: Array<{ text: string; correction?: Correction }> = [];
  let lastIndex = 0;

  sortedCorrections.forEach((correction) => {
    // Add text before correction
    if (correction.position.start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, correction.position.start),
      });
    }

    // Add correction
    segments.push({
      text: text.substring(correction.position.start, correction.position.end),
      correction,
    });

    lastIndex = correction.position.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
    });
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Corrections ({corrections.length})
        </h4>
        <div className="flex gap-2 text-xs">
          <span className="text-red-600">
            {corrections.filter((c) => c.severity === 'critical').length} critical
          </span>
          <span className="text-orange-600">
            {corrections.filter((c) => c.severity === 'major').length} major
          </span>
          <span className="text-yellow-600">
            {corrections.filter((c) => c.severity === 'minor').length} minor
          </span>
        </div>
      </div>

      <div className="text-sm leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.correction) {
            return (
              <CorrectionTooltip key={index} correction={segment.correction}>
                {segment.text}
              </CorrectionTooltip>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>
    </div>
  );
}
