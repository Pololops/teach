import { create } from 'zustand';

export type Screen = 'home' | 'chat' | 'game';

interface NavigationState {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentScreen: 'home',
  navigateTo: (screen) => set({ currentScreen: screen }),
}));

