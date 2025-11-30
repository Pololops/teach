import OpenAI from 'openai';
import { AI_GAME_PROMPT } from '../../prompts/aiGame';
import type { CEFRLevel } from '@teach/shared';

export interface GameQuestionResponse {
  emoji: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const POOL_SIZE_PER_LEVEL = 3; // Small pool to start, will refill in background
const MIN_POOL_SIZE = 1; // Trigger refill when pool drops below this
const GENERATION_TIMEOUT = 30000; // 30 seconds timeout for AI calls

/**
 * Game Service - Generates emoji guessing game questions with caching
 */
export class GameService {
  private client: OpenAI;
  private model: string;
  private questionPool: Map<CEFRLevel, GameQuestionResponse[]> = new Map();
  private isInitialized = false;
  private isRefilling = false;

  constructor() {
    // Initialize Ollama client using OpenAI-compatible API
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1';
    
    this.client = new OpenAI({
      baseURL,
      apiKey: 'ollama', // Required by SDK but not used by Ollama
    });

    // Initialize empty pools for each level
    CEFR_LEVELS.forEach((level) => {
      this.questionPool.set(level, []);
    });
  }

  /**
   * Pre-generate questions for all CEFR levels
   * This should be called on server startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Game service already initialized');
      return;
    }

    console.log('Initializing game service with pre-generated questions...');
    const startTime = Date.now();

    try {
      // Generate questions sequentially to avoid overloading Ollama
      for (const level of CEFR_LEVELS) {
        console.log(`Generating questions for level ${level}...`);
        await this.fillPoolForLevel(level, POOL_SIZE_PER_LEVEL);
      }

      this.isInitialized = true;
      const duration = Date.now() - startTime;
      const totalQuestions = CEFR_LEVELS.length * POOL_SIZE_PER_LEVEL;
      console.log(
        `✅ Game service initialized in ${(duration / 1000).toFixed(1)}s with ${totalQuestions} questions`
      );
    } catch (error) {
      console.error('Failed to initialize game service:', error);
      // Set initialized anyway to not block the server
      this.isInitialized = true;
    }
  }

  /**
   * Generate a new game question (serves from pool, refills in background)
   */
  async generateQuestion(
    level: CEFRLevel = 'B1',
    previousWords: string[] = []
  ): Promise<GameQuestionResponse> {
    // Try to get from pool first
    const pooledQuestion = this.getQuestionFromPool(level, previousWords);

    if (pooledQuestion) {
      // Trigger background refill if pool is getting low
      const currentPoolSize = this.questionPool.get(level)?.length || 0;
      if (currentPoolSize < MIN_POOL_SIZE && !this.isRefilling) {
        this.refillPoolInBackground(level).catch((error) =>
          console.error('Background refill error:', error)
        );
      }

      return pooledQuestion;
    }

    // Pool is empty or no suitable question found, generate on-demand
    console.warn(
      `Pool empty for level ${level}, generating on-demand (slower)`
    );
    return await this.generateNewQuestion(level, previousWords);
  }

  /**
   * Get a question from the pool that doesn't use any previous words
   */
  private getQuestionFromPool(
    level: CEFRLevel,
    previousWords: string[]
  ): GameQuestionResponse | null {
    const pool = this.questionPool.get(level);
    if (!pool || pool.length === 0) {
      return null;
    }

    // If no previous words restriction, just return and remove first question
    if (previousWords.length === 0) {
      return pool.shift()!;
    }

    // Find a question that doesn't use any of the previous words
    const index = pool.findIndex(
      (q) => !previousWords.includes(q.correctAnswer.toLowerCase())
    );

    if (index === -1) {
      // No suitable question found, return first one anyway
      return pool.shift()!;
    }

    // Remove and return the found question
    return pool.splice(index, 1)[0];
  }

  /**
   * Fill the pool for a specific level
   */
  private async fillPoolForLevel(
    level: CEFRLevel,
    count: number
  ): Promise<void> {
    const pool = this.questionPool.get(level)!;
    const usedWords = new Set<string>(pool.map((q) => q.correctAnswer));

    for (let i = 0; i < count; i++) {
      try {
        const question = await this.generateNewQuestion(
          level,
          Array.from(usedWords)
        );
        pool.push(question);
        usedWords.add(question.correctAnswer);

        // Add a small delay between requests
        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(
          `Failed to generate question ${i + 1}/${count} for level ${level}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log(`✓ Generated ${pool.length}/${count} questions for level ${level}`);
  }

  /**
   * Refill pool in background
   */
  private async refillPoolInBackground(level: CEFRLevel): Promise<void> {
    if (this.isRefilling) {
      return;
    }

    this.isRefilling = true;
    console.log(`Background refill started for level ${level}`);

    try {
      const currentSize = this.questionPool.get(level)?.length || 0;
      const neededQuestions = POOL_SIZE_PER_LEVEL - currentSize;

      if (neededQuestions > 0) {
        await this.fillPoolForLevel(level, neededQuestions);
      }
    } finally {
      this.isRefilling = false;
    }
  }

  /**
   * Generate a new question with timeout
   */
  private async generateNewQuestion(
    level: CEFRLevel,
    previousWords: string[]
  ): Promise<GameQuestionResponse> {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Question generation timeout')),
          GENERATION_TIMEOUT
        )
      );

      // Create generation promise
      const generationPromise = this.generateWithOllama(level, previousWords);

      // Race between generation and timeout
      return await Promise.race([generationPromise, timeoutPromise]);
    } catch (error: any) {
      console.error('Game service error:', error);
      
      // Transform Ollama-specific errors
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }
      if (error.status === 404 || error.message?.includes('model')) {
        throw new Error(`Model '${this.model}' not found. Please pull the model with: ollama pull ${this.model}`);
      }
      
      throw error;
    }
  }

  /**
   * Generate question using Ollama
   */
  private async generateWithOllama(
    level: CEFRLevel,
    previousWords: string[]
  ): Promise<GameQuestionResponse> {
    let userPrompt = `Generate an emoji game question for CEFR level ${level}.`;
    if (previousWords.length > 0) {
      userPrompt += ` Don't use these words: ${previousWords.join(', ')}`;
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: AI_GAME_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.8, // Higher temperature for more variety
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseGameQuestion(content);
  }

  /**
   * Parse AI response into structured game question data
   */
  private parseGameQuestion(response: string): GameQuestionResponse {
    try {
      // Clean up response - remove markdown code blocks if present
      let cleaned = response.trim();

      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      cleaned = cleaned.trim();

      // Parse JSON
      const parsed = JSON.parse(cleaned);

      // Validate structure
      if (
        typeof parsed.emoji !== 'string' ||
        typeof parsed.correctAnswer !== 'string' ||
        !Array.isArray(parsed.wrongAnswers) ||
        parsed.wrongAnswers.length !== 2
      ) {
        throw new Error('Invalid response structure');
      }

      // Validate all wrong answers are strings
      if (!parsed.wrongAnswers.every((w: any) => typeof w === 'string')) {
        throw new Error('Invalid wrong answers format');
      }

      return {
        emoji: parsed.emoji,
        correctAnswer: parsed.correctAnswer,
        wrongAnswers: parsed.wrongAnswers,
      };
    } catch (error) {
      console.error('Failed to parse game question response:', error);
      console.error('Response was:', response);
      throw new Error('Failed to generate valid game question');
    }
  }
}

export const gameService = new GameService();
