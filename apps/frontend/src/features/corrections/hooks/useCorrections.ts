import { useMemo } from 'react';
import type { Correction } from '@teach/shared';
import { correctionsAnalyzer } from '../lib/correctionsAnalyzer';

interface UseCorrectionsOptions {
  text: string;
  enabled?: boolean;
}

export function useCorrections({ text, enabled = true }: UseCorrectionsOptions) {
  const corrections = useMemo(() => {
    if (!enabled || !text.trim()) return [];
    return correctionsAnalyzer.analyze(text);
  }, [text, enabled]);

  const correctionsByType = useMemo(() => {
    const grouped: Record<string, Correction[]> = {
      grammar: [],
      spelling: [],
      vocabulary: [],
      punctuation: [],
      style: [],
    };

    corrections.forEach((correction) => {
      grouped[correction.type].push(correction);
    });

    return grouped;
  }, [corrections]);

  const correctionsBySeverity = useMemo(() => {
    const grouped: Record<string, Correction[]> = {
      critical: [],
      major: [],
      minor: [],
    };

    corrections.forEach((correction) => {
      grouped[correction.severity].push(correction);
    });

    return grouped;
  }, [corrections]);

  const stats = useMemo(
    () => ({
      total: corrections.length,
      critical: correctionsBySeverity.critical.length,
      major: correctionsBySeverity.major.length,
      minor: correctionsBySeverity.minor.length,
    }),
    [corrections, correctionsBySeverity]
  );

  return {
    corrections,
    correctionsByType,
    correctionsBySeverity,
    stats,
  };
}
