import { useCallback, useState } from 'react';
import type { CEFRLevel } from '@teach/shared';
import { cefrAnalyzer } from '../lib/cefrAnalyzer';
import { trackLevelChange } from '@/shared/lib/storage/entities/progress';

interface LevelDetectionOptions {
  userId: string;
  currentLevel: CEFRLevel;
  onLevelChange?: (newLevel: CEFRLevel, confidence: number) => void;
  minConfidence?: number; // Minimum confidence to trigger level change
  minSamples?: number; // Minimum number of messages before detection
}

interface LevelDetectionResult {
  suggestedLevel: CEFRLevel;
  confidence: number;
  shouldAdjust: boolean;
}

export function useLevelDetection({
  userId,
  currentLevel,
  onLevelChange,
  minConfidence = 0.7,
  minSamples = 3,
}: LevelDetectionOptions) {
  const [messageCount, setMessageCount] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState<
    Array<{ level: CEFRLevel; confidence: number }>
  >([]);

  /**
   * Analyze a user message and potentially adjust level
   */
  const analyzeMessage = useCallback(
    async (messageText: string): Promise<LevelDetectionResult> => {
      const analysis = cefrAnalyzer.analyze(messageText);

      // Store analysis
      setRecentAnalyses((prev) => [
        ...prev.slice(-4), // Keep last 5 analyses
        { level: analysis.suggestedLevel, confidence: analysis.confidence },
      ]);
      setMessageCount((prev) => prev + 1);

      // Check if we should adjust level
      const shouldAdjust = await checkLevelAdjustment(
        analysis.suggestedLevel,
        analysis.confidence
      );

      return {
        suggestedLevel: analysis.suggestedLevel,
        confidence: analysis.confidence,
        shouldAdjust,
      };
    },
    [userId, currentLevel, minConfidence, minSamples, recentAnalyses]
  );

  /**
   * Check if level should be adjusted based on recent analyses
   */
  const checkLevelAdjustment = useCallback(
    async (suggestedLevel: CEFRLevel, confidence: number): Promise<boolean> => {
      // Need minimum samples
      if (messageCount < minSamples) return false;

      // Need minimum confidence
      if (confidence < minConfidence) return false;

      // Check if majority of recent analyses suggest a different level
      const allAnalyses = [
        ...recentAnalyses,
        { level: suggestedLevel, confidence },
      ];

      if (allAnalyses.length < 3) return false;

      // Count level suggestions
      const levelCounts = allAnalyses.reduce((acc, analysis) => {
        acc[analysis.level] = (acc[analysis.level] || 0) + 1;
        return acc;
      }, {} as Record<CEFRLevel, number>);

      // Find most suggested level
      const mostSuggestedLevel = Object.entries(levelCounts).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0] as CEFRLevel;

      // If most suggested level is different from current and appears in majority
      if (
        mostSuggestedLevel !== currentLevel &&
        levelCounts[mostSuggestedLevel] >= allAnalyses.length / 2
      ) {
        // Track level change
        await trackLevelChange(userId, mostSuggestedLevel, confidence);

        // Notify callback
        onLevelChange?.(mostSuggestedLevel, confidence);

        // Reset analyses
        setRecentAnalyses([]);
        setMessageCount(0);

        return true;
      }

      return false;
    },
    [userId, currentLevel, minConfidence, minSamples, messageCount, recentAnalyses, onLevelChange]
  );

  return {
    analyzeMessage,
    messageCount,
    recentAnalyses,
  };
}
