import { cn } from '@/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FeatureTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

/**
 * Reusable feature tile for home screen
 */
export function FeatureTile({
  title,
  description,
  icon: Icon,
  onClick,
  className,
}: FeatureTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

