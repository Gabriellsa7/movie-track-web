import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TThemePreference = 'dark' | 'light' | 'system';

interface IThemeState {
  preference: TThemePreference;
  setPreference: (preference: TThemePreference) => void;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set) => ({
      preference: 'dark',
      setPreference: (preference) => {
        set({ preference });
      },
    }),
    {
      name: 'movie-track:theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
