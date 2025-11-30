import { create } from 'zustand';
import type { GameSession, GameQuestion, AppError } from '@teach/shared';

interface GameState {
  // Current session
  currentSession: GameSession | null;
  currentQuestion: GameQuestion | null;
  currentAttempts: number;
  usedWords: string[];
  
  // UI state
  isLoading: boolean;
  error: AppError | null;
  showResult: 'correct' | 'wrong' | null;
  
  // Actions
  setSession: (session: GameSession | null) => void;
  setQuestion: (question: GameQuestion | null) => void;
  incrementAttempts: () => void;
  resetAttempts: () => void;
  addUsedWord: (word: string) => void;
  clearUsedWords: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AppError | null) => void;
  setShowResult: (result: 'correct' | 'wrong' | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  // Initial state
  currentSession: null,
  currentQuestion: null,
  currentAttempts: 0,
  usedWords: [],
  isLoading: false,
  error: null,
  showResult: null,
  
  // Actions
  setSession: (session) => set({ currentSession: session }),
  setQuestion: (question) => set({ currentQuestion: question }),
  incrementAttempts: () => set((state) => ({ currentAttempts: state.currentAttempts + 1 })),
  resetAttempts: () => set({ currentAttempts: 0 }),
  addUsedWord: (word) => set((state) => ({ usedWords: [...state.usedWords, word] })),
  clearUsedWords: () => set({ usedWords: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setShowResult: (result) => set({ showResult: result }),
  resetGame: () => set({
    currentSession: null,
    currentQuestion: null,
    currentAttempts: 0,
    usedWords: [],
    isLoading: false,
    error: null,
    showResult: null,
  }),
}));

