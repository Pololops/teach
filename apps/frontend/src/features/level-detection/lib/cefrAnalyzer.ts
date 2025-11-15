import type { CEFRLevel } from '@teach/shared';

interface LevelIndicators {
  vocabularyComplexity: number; // 0-1
  sentenceComplexity: number; // 0-1
  grammarComplexity: number; // 0-1
  errorRate: number; // 0-1
}

interface AnalysisResult {
  suggestedLevel: CEFRLevel;
  confidence: number; // 0-1
  indicators: LevelIndicators;
}

/**
 * Rule-based CEFR level analyzer
 * Analyzes user text to estimate proficiency level
 */
export class CEFRAnalyzer {
  /**
   * Analyze text and suggest CEFR level
   */
  analyze(text: string): AnalysisResult {
    const indicators = this.calculateIndicators(text);
    const suggestedLevel = this.determineLevel(indicators);
    const confidence = this.calculateConfidence(indicators);

    return {
      suggestedLevel,
      confidence,
      indicators,
    };
  }

  private calculateIndicators(text: string): LevelIndicators {
    const words = this.tokenizeWords(text);
    const sentences = this.tokenizeSentences(text);

    return {
      vocabularyComplexity: this.analyzeVocabulary(words),
      sentenceComplexity: this.analyzeSentences(sentences, words),
      grammarComplexity: this.analyzeGrammar(text),
      errorRate: this.estimateErrors(text),
    };
  }

  private tokenizeWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }

  private tokenizeSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Analyze vocabulary complexity (0-1)
   * Based on word length and variety
   */
  private analyzeVocabulary(words: string[]): number {
    if (words.length === 0) return 0;

    // Average word length
    const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const lengthScore = Math.min(avgLength / 8, 1); // 8+ chars = complex

    // Vocabulary diversity (unique words ratio)
    const uniqueWords = new Set(words);
    const diversityScore = uniqueWords.size / words.length;

    // Long word usage (7+ characters)
    const longWords = words.filter((w) => w.length >= 7).length;
    const longWordRatio = longWords / words.length;

    return (lengthScore * 0.4 + diversityScore * 0.3 + longWordRatio * 0.3);
  }

  /**
   * Analyze sentence complexity (0-1)
   * Based on length and structure
   */
  private analyzeSentences(sentences: string[], words: string[]): number {
    if (sentences.length === 0) return 0;

    // Average sentence length (in words)
    const avgSentenceLength = words.length / sentences.length;
    const lengthScore = Math.min(avgSentenceLength / 20, 1); // 20+ words = complex

    // Sentence variety (check for different lengths)
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
    const varietyScore = Math.min(Math.sqrt(variance) / 10, 1);

    return (lengthScore * 0.6 + varietyScore * 0.4);
  }

  /**
   * Analyze grammar complexity (0-1)
   * Based on tense usage, connectors, and structure
   */
  private analyzeGrammar(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    // Complex tenses
    const complexTenses = [
      /have been \w+ing/g, // present perfect continuous
      /had been \w+ing/g, // past perfect continuous
      /will have \w+ed/g, // future perfect
      /would have \w+ed/g, // conditional perfect
    ];
    complexTenses.forEach((pattern) => {
      if (pattern.test(lowerText)) score += 0.15;
    });

    // Advanced connectors
    const advancedConnectors = [
      'however', 'moreover', 'nevertheless', 'furthermore',
      'consequently', 'therefore', 'although', 'whereas',
      'nonetheless', 'meanwhile',
    ];
    advancedConnectors.forEach((connector) => {
      if (lowerText.includes(connector)) score += 0.05;
    });

    // Passive voice indicators
    if (/\b(is|are|was|were|been) \w+(ed|en)\b/g.test(lowerText)) {
      score += 0.1;
    }

    // Relative clauses
    if (/\b(which|whose|whom)\b/g.test(lowerText)) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  /**
   * Estimate error rate (0-1)
   * Higher rate = lower level
   */
  private estimateErrors(text: string): number {
    let errorCount = 0;

    // Basic capitalization errors
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && !/^[A-Z]/.test(trimmed)) {
        errorCount++;
      }
    });

    // Double spaces
    if (/\s{2,}/.test(text)) errorCount++;

    // Missing spaces after punctuation
    if (/[,;:][a-zA-Z]/.test(text)) errorCount++;

    // Common verb agreement errors (simplified)
    const agreementErrors = [
      /he don't/gi,
      /she don't/gi,
      /it don't/gi,
      /I is/gi,
      /you is/gi,
      /we was/gi,
      /they was/gi,
    ];
    agreementErrors.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) errorCount += matches.length;
    });

    // Normalize error count (assume 1 error per 20 words is high)
    const wordCount = this.tokenizeWords(text).length;
    const errorRate = Math.min(errorCount / (wordCount / 20), 1);

    return errorRate;
  }

  /**
   * Determine CEFR level from indicators
   */
  private determineLevel(indicators: LevelIndicators): CEFRLevel {
    // Calculate overall score (0-1)
    // Error rate is inversed (high errors = low level)
    const overallScore =
      indicators.vocabularyComplexity * 0.3 +
      indicators.sentenceComplexity * 0.3 +
      indicators.grammarComplexity * 0.3 +
      (1 - indicators.errorRate) * 0.1;

    // Map score to CEFR level
    if (overallScore < 0.2) return 'A1';
    if (overallScore < 0.35) return 'A2';
    if (overallScore < 0.5) return 'B1';
    if (overallScore < 0.65) return 'B2';
    if (overallScore < 0.8) return 'C1';
    return 'C2';
  }

  /**
   * Calculate confidence in the analysis
   */
  private calculateConfidence(indicators: LevelIndicators): number {
    // Confidence is higher when indicators are consistent
    const values = [
      indicators.vocabularyComplexity,
      indicators.sentenceComplexity,
      indicators.grammarComplexity,
      1 - indicators.errorRate,
    ];

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;

    // Low variance = high confidence
    const confidence = Math.max(0.5, 1 - variance * 2);

    return Math.min(confidence, 1);
  }
}

export const cefrAnalyzer = new CEFRAnalyzer();
