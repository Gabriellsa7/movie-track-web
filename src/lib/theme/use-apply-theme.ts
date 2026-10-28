import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme.store';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Puts the resolved theme on <html data-theme>, following the OS when the preference is "system".
export function useApplyTheme() {
  const preference = useThemeStore((state) => state.preference);

  useEffect(() => {
    const root = document.documentElement;
    if (preference !== 'system') {
      root.dataset.theme = preference;
      return;
    }
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const apply = () => {
      root.dataset.theme = media.matches ? 'dark' : 'light';
    };
    apply();
    media.addEventListener('change', apply);
    return () => {
      media.removeEventListener('change', apply);
    };
  }, [preference]);
}
