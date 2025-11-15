import type { Correction, CorrectionType, CorrectionSeverity } from '@teach/shared';

interface DetectedError {
  type: CorrectionType;
  original: string;
  suggested: string;
  explanation: string;
  severity: CorrectionSeverity;
  start: number;
  end: number;
}

/**
 * Rule-based corrections analyzer
 * Detects common grammar, spelling, and vocabulary errors
 */
export class CorrectionsAnalyzer {
  /**
   * Analyze text and return detected corrections
   */
  analyze(text: string): Correction[] {
    const errors: DetectedError[] = [];

    // Run all analysis passes
    errors.push(...this.detectGrammarErrors(text));
    errors.push(...this.detectSpellingErrors(text));
    errors.push(...this.detectVocabularyIssues(text));
    errors.push(...this.detectPunctuationErrors(text));
    errors.push(...this.detectStyleIssues(text));

    // Convert to Correction objects
    return errors.map((error) => ({
      id: crypto.randomUUID(),
      type: error.type,
      original: error.original,
      suggested: error.suggested,
      explanation: error.explanation,
      severity: error.severity,
      position: {
        start: error.start,
        end: error.end,
      },
    }));
  }

  /**
   * Detect common grammar errors
   */
  private detectGrammarErrors(text: string): DetectedError[] {
    const errors: DetectedError[] = [];

    // Subject-verb agreement
    const agreementPatterns = [
      {
        pattern: /\b(he|she|it)\s+don't\b/gi,
        suggested: "doesn't",
        explanation: 'Use "doesn\'t" with he/she/it',
      },
      {
        pattern: /\b(I|you|we|they)\s+doesn't\b/gi,
        suggested: "don't",
        explanation: 'Use "don\'t" with I/you/we/they',
      },
      {
        pattern: /\bI\s+is\b/gi,
        suggested: 'I am',
        explanation: 'Use "I am" instead of "I is"',
      },
      {
        pattern: /\b(he|she|it)\s+are\b/gi,
        suggested: 'is',
        explanation: 'Use "is" with he/she/it',
      },
      {
        pattern: /\b(we|they)\s+was\b/gi,
        suggested: 'were',
        explanation: 'Use "were" with we/they',
      },
    ];

    agreementPatterns.forEach(({ pattern, suggested, explanation }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          type: 'grammar',
          original: match[0],
          suggested: match[1] + ' ' + suggested,
          explanation,
          severity: 'critical',
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    // Articles
    const articlePatterns = [
      {
        pattern: /\ba\s+([aeiou]\w+)/gi,
        explanation: 'Use "an" before vowel sounds',
      },
      {
        pattern: /\ban\s+([^aeiou]\w+)/gi,
        explanation: 'Use "a" before consonant sounds',
      },
    ];

    articlePatterns.forEach(({ pattern, explanation }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const article = match[0].startsWith('a ') ? 'an' : 'a';
        errors.push({
          type: 'grammar',
          original: match[0],
          suggested: article + ' ' + match[1],
          explanation,
          severity: 'major',
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    return errors;
  }

  /**
   * Detect common spelling errors
   */
  private detectSpellingErrors(text: string): DetectedError[] {
    const errors: DetectedError[] = [];

    // Common misspellings
    const misspellings: Record<string, { correct: string; explanation: string }> = {
      'teh': { correct: 'the', explanation: 'Common typo' },
      'recieve': { correct: 'receive', explanation: 'Remember: i before e except after c' },
      'occured': { correct: 'occurred', explanation: 'Double r before -ed' },
      'definately': { correct: 'definitely', explanation: 'Common misspelling' },
      'seperate': { correct: 'separate', explanation: 'Remember: there\'s "a rat" in separate' },
      'alot': { correct: 'a lot', explanation: 'Two separate words' },
      'dont': { correct: "don't", explanation: 'Missing apostrophe' },
      'cant': { correct: "can't", explanation: 'Missing apostrophe' },
      'wont': { correct: "won't", explanation: 'Missing apostrophe' },
      'shouldnt': { correct: "shouldn't", explanation: 'Missing apostrophe' },
    };

    Object.entries(misspellings).forEach(([wrong, { correct, explanation }]) => {
      const pattern = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          type: 'spelling',
          original: match[0],
          suggested: correct,
          explanation,
          severity: 'major',
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    return errors;
  }

  /**
   * Detect vocabulary issues
   */
  private detectVocabularyIssues(text: string): DetectedError[] {
    const errors: DetectedError[] = [];

    // Word choice issues
    const wordChoice: Record<string, { better: string; explanation: string }> = {
      'very good': { better: 'excellent', explanation: 'More precise vocabulary' },
      'very bad': { better: 'terrible', explanation: 'More precise vocabulary' },
      'very big': { better: 'huge/enormous', explanation: 'More precise vocabulary' },
      'very small': { better: 'tiny/minuscule', explanation: 'More precise vocabulary' },
      'very happy': { better: 'delighted/thrilled', explanation: 'More precise vocabulary' },
      'very sad': { better: 'devastated/heartbroken', explanation: 'More precise vocabulary' },
    };

    Object.entries(wordChoice).forEach(([phrase, { better, explanation }]) => {
      const pattern = new RegExp(`\\b${phrase}\\b`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          type: 'vocabulary',
          original: match[0],
          suggested: better,
          explanation,
          severity: 'minor',
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    return errors;
  }

  /**
   * Detect punctuation errors
   */
  private detectPunctuationErrors(text: string): DetectedError[] {
    const errors: DetectedError[] = [];

    // Missing space after punctuation
    const pattern = /([,.!?;:])([a-zA-Z])/g;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      errors.push({
        type: 'punctuation',
        original: match[0],
        suggested: match[1] + ' ' + match[2],
        explanation: 'Add space after punctuation',
        severity: 'minor',
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Multiple spaces
    const spacePattern = /\s{2,}/g;
    while ((match = spacePattern.exec(text)) !== null) {
      errors.push({
        type: 'punctuation',
        original: match[0],
        suggested: ' ',
        explanation: 'Use single space',
        severity: 'minor',
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return errors;
  }

  /**
   * Detect style issues
   */
  private detectStyleIssues(text: string): DetectedError[] {
    const errors: DetectedError[] = [];

    // Sentence capitalization
    const sentences = text.split(/[.!?]+/);
    let currentIndex = 0;

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        const sentenceStart = text.indexOf(trimmed, currentIndex);
        if (!/^[A-Z]/.test(trimmed)) {
          errors.push({
            type: 'style',
            original: trimmed[0],
            suggested: trimmed[0].toUpperCase(),
            explanation: 'Capitalize first letter of sentence',
            severity: 'minor',
            start: sentenceStart,
            end: sentenceStart + 1,
          });
        }
        currentIndex = sentenceStart + trimmed.length;
      }
    });

    return errors;
  }
}

export const correctionsAnalyzer = new CorrectionsAnalyzer();
