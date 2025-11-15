import { useProgress } from '../hooks/useProgress';
import { ProgressStats } from './ProgressStats';
import { LevelHistory } from './LevelHistory';

interface ProgressDashboardProps {
  userId: string;
}

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const { data: progress, isLoading, error } = useProgress(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading progress...</div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading progress: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your English learning journey</p>
      </div>

      <ProgressStats progress={progress} />

      <LevelHistory levelHistory={progress.levelHistory} />

      {progress.vocabularyEncountered.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Vocabulary Encountered ({progress.vocabularyEncountered.length} words)
          </h3>
          <div className="flex flex-wrap gap-2">
            {progress.vocabularyEncountered.slice(0, 50).map((word: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {word}
              </span>
            ))}
            {progress.vocabularyEncountered.length > 50 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{progress.vocabularyEncountered.length - 50} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
