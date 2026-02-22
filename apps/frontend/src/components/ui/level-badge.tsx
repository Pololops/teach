import type { CEFRLevel } from '@teach/shared';

const levelColors: Record<CEFRLevel, string> = {
  A1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  A2: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  B2: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  C1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  C2: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

interface LevelBadgeProps {
  level: CEFRLevel;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColors[level]}`}>
      {level}
    </span>
  );
}
