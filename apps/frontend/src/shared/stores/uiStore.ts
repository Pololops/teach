import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // UI state
  isTyping: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeConversationId: string | null;

  // Actions
  setTyping: (isTyping: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveConversation: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isTyping: false,
      isSidebarOpen: false,
      theme: 'system',
      activeConversationId: null,

      // Actions
      setTyping: (isTyping) => set({ isTyping }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
    }),
    {
      name: 'teach-ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
