import type { LevelChange } from '@teach/shared';

interface LevelHistoryProps {
  levelHistory: LevelChange[];
}

export function LevelHistory({ levelHistory }: LevelHistoryProps) {
  if (levelHistory.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No level changes yet. Keep practicing!</p>
      </div>
    );
  }

  const sortedHistory = [...levelHistory].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Level History</h3>
      <div className="space-y-2">
        {sortedHistory.map((change, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {change.level}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Advanced to {change.level}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(change.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Confidence
              </div>
              <div className="text-lg font-bold text-primary">
                {Math.round(change.confidence * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
