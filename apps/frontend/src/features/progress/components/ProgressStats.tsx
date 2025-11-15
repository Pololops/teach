import type { ProgressMetrics } from '@teach/shared';

interface ProgressStatsProps {
  progress: ProgressMetrics;
}

export function ProgressStats({ progress }: ProgressStatsProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = [
    {
      label: 'Current Level',
      value: progress.currentLevel,
      icon: '🎯',
    },
    {
      label: 'Total Messages',
      value: progress.totalMessages,
      icon: '💬',
    },
    {
      label: 'Vocabulary Encountered',
      value: `${progress.vocabularyEncountered.length} words`,
      icon: '📚',
    },
    {
      label: 'Vocabulary Mastered',
      value: `${progress.vocabularyMastered.length} words`,
      icon: '✨',
    },
    {
      label: 'Practice Time',
      value: formatTime(progress.totalTime),
      icon: '⏱️',
    },
    {
      label: 'Conversations',
      value: progress.totalConversations,
      icon: '💭',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
