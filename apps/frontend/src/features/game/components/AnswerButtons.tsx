import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface AnswerButtonsProps {
  correctAnswer: string;
  wrongAnswers: string[];
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Three answer buttons in randomized order
 */
export function AnswerButtons({
  correctAnswer,
  wrongAnswers,
  onAnswer,
  disabled = false,
}: AnswerButtonsProps) {
  // Randomize order once when answers change
  const answers = useMemo(() => {
    const allAnswers = [correctAnswer, ...wrongAnswers];
    return shuffleArray(allAnswers);
  }, [correctAnswer, wrongAnswers]);

  return (
    <div className="flex flex-row gap-3 justify-center flex-wrap">
      {answers.map((answer) => (
        <Button
          key={answer}
          onClick={() => onAnswer(answer)}
          disabled={disabled}
          size="lg"
          variant="outline"
          className="min-w-[120px] text-base font-semibold capitalize"
        >
          {answer}
        </Button>
      ))}
    </div>
  );
}

