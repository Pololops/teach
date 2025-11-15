import { useState } from 'react';
import type { Correction } from '@teach/shared';
import { cn } from '@/shared/lib/utils';

interface CorrectionTooltipProps {
  correction: Correction;
  children: React.ReactNode;
}

export function CorrectionTooltip({ correction, children }: CorrectionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const severityColors = {
    critical: 'border-red-500 bg-red-50 text-red-900',
    major: 'border-orange-500 bg-orange-50 text-orange-900',
    minor: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  };

  const severityUnderline = {
    critical: 'decoration-red-500 decoration-wavy decoration-2',
    major: 'decoration-orange-500 decoration-wavy decoration-2',
    minor: 'decoration-yellow-500 decoration-wavy decoration-1',
  };

  return (
    <span className="relative inline-block">
      <span
        className={cn(
          'underline cursor-pointer',
          severityUnderline[correction.severity]
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </span>

      {isOpen && (
        <div
          className={cn(
            'absolute z-10 mt-2 p-3 rounded-lg border-2 shadow-lg min-w-[250px] max-w-[350px]',
            severityColors[correction.severity]
          )}
          style={{ top: '100%', left: '0' }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold uppercase">
              {correction.type}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-white/50 rounded">
              {correction.severity}
            </span>
          </div>

          <div className="mb-2">
            <div className="text-sm mb-1">
              <span className="font-medium">Original:</span>{' '}
              <span className="line-through">{correction.original}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Suggested:</span>{' '}
              <span className="font-semibold">{correction.suggested}</span>
            </div>
          </div>

          <p className="text-xs">{correction.explanation}</p>
        </div>
      )}
    </span>
  );
}
