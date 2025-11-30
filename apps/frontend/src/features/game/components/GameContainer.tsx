import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { SectionLayout } from '@/components/ui/section-layout';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { getUser } from '@/shared/lib/storage/entities/user';
import { useGameSession } from '../hooks/useGameSession';
import { EmojiDisplay } from './EmojiDisplay';
import { AnswerButtons } from './AnswerButtons';
import { ResultOverlay } from './ResultOverlay';
import { GameStats } from './GameStats';
import { parseError } from '@teach/shared';
import type { AppError, ErrorAction } from '@teach/shared';

/**
 * Main game container managing the emoji guessing game
 */
export function GameContainer() {
  const { navigateTo } = useNavigationStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B1');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<AppError | null>(null);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getUser();
        setUserId(user.id);
        setUserLevel(user.currentLevel);
      } catch (err) {
        setInitError(parseError(err));
      } finally {
        setIsInitializing(false);
      }
    }
    loadUser();
  }, []);

  const {
    session,
    question,
    attempts,
    maxAttempts,
    isLoading,
    error,
    showResult,
    submitAnswer,
    endGame,
  } = useGameSession({
    userId: userId || '',
    level: userLevel,
  });

  const handleBack = async () => {
    await endGame();
    navigateTo('home');
  };

  const handleErrorAction = (action: ErrorAction) => {
    switch (action.action) {
      case 'retry':
        window.location.reload();
        break;
      case 'navigate':
        if (action.target === '/') {
          navigateTo('home');
        } else {
          // Handle other navigation targets
          navigateTo('home');
        }
        break;
      case 'dismiss':
        setInitError(null);
        break;
      case 'wait':
        // Wait action - do nothing, user acknowledged
        break;
      case 'contact':
        // Open support (could be email, help page, etc.)
        window.location.href = 'mailto:support@teach.app?subject=Help Needed';
        break;
      default:
        break;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (initError || !userId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
        {initError && (
          <div className="w-full max-w-md">
            <ErrorDisplay error={initError} onAction={handleErrorAction} />
          </div>
        )}
        <Button onClick={() => navigateTo('home')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-full max-w-md">
          <ErrorDisplay error={error} onAction={handleErrorAction} />
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const isWaitingForNextQuestion = showResult === 'correct' || (showResult === 'wrong' && attempts >= maxAttempts);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionLayout
        title="Jeu des émojis"
        onBack={handleBack}
      >
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
          {isLoading && !question ? (
            <div className="text-muted-foreground">Chargement...</div>
          ) : question ? (
            <>
              {/* Stats */}
              {session && <GameStats session={session} />}

              {/* Emoji Display */}
              <EmojiDisplay
                emoji={question.emoji}
                shake={showResult === 'wrong' && attempts < maxAttempts}
              />

              {/* Attempts Indicator */}
              <div className="flex gap-2">
                {Array.from({ length: maxAttempts }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${index < attempts
                      ? 'bg-red-500'
                      : 'bg-muted'
                      }`}
                  />
                ))}
              </div>

              {/* Answer Buttons */}
              <AnswerButtons
                correctAnswer={question.correctAnswer}
                wrongAnswers={question.wrongAnswers}
                onAnswer={submitAnswer}
                disabled={isLoading || isWaitingForNextQuestion}
              />
            </>
          ) : null}
        </div>

        {/* Result Overlay */}
        <ResultOverlay
          result={showResult === 'correct' ? 'correct' : 'wrong'}
          show={isWaitingForNextQuestion}
        />
      </SectionLayout>
    </div>
  );
}

