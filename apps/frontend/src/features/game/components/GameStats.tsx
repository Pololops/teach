import type { GameSession } from '@teach/shared';

interface GameStatsProps {
  session: GameSession;
}

/**
 * Display current game session statistics
 */
export function GameStats({ session }: GameStatsProps) {
  const accuracy = session.totalQuestions > 0
    ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
    : 0;

  return (
    <div className="flex gap-6 justify-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{session.score}</span>
        <span>Points</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{session.currentStreak}</span>
        <span>Série</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-foreground">{accuracy}%</span>
        <span>Précision</span>
      </div>
    </div>
  );
}

