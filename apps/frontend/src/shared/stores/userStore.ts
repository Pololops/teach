import { create } from 'zustand';
import type { User, UserPreferences, CEFRLevel } from '@teach/shared';
import {
  getUser,
  updateUserLevel,
  updateUserPreferences,
} from '../lib/storage/entities/user';

interface UserState {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  currentLevel: CEFRLevel | null;
  preferences: UserPreferences | null;

  // Actions
  loadUser: () => Promise<void>;
  updateLevel: (level: CEFRLevel) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  currentUser: null,
  isLoading: false,
  error: null,

  // Computed
  get currentLevel() {
    return get().currentUser?.currentLevel ?? null;
  },
  get preferences() {
    return get().currentUser?.preferences ?? null;
  },

  // Actions
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getUser();
      set({ currentUser: user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load user';
      set({ error: message, isLoading: false });
    }
  },

  updateLevel: async (level: CEFRLevel) => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ error: 'No user loaded' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await updateUserLevel(currentUser.id, level);
      const updatedUser = await getUser();
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update level';
      set({ error: message, isLoading: false });
    }
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ error: 'No user loaded' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updatedPrefs = { ...currentUser.preferences, ...preferences };
      await updateUserPreferences(currentUser.id, updatedPrefs);
      const updatedUser = await getUser();
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update preferences';
      set({ error: message, isLoading: false });
    }
  },

  reset: () => {
    set({ currentUser: null, isLoading: false, error: null });
  },
}));
