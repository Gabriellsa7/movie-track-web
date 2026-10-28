import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useThemeStore } from '@/stores/theme.store';
import { useApplyTheme } from './use-apply-theme';

function mockSystemScheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_type: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => media);
  return {
    change(nextDark: boolean) {
      media.matches = nextDark;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  useThemeStore.setState({ preference: 'dark' });
});

describe('When we apply the theme preference', () => {
  it('should use the chosen theme', () => {
    useThemeStore.setState({ preference: 'light' });

    renderHook(() => {
      useApplyTheme();
    });

    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should follow the system and its changes', () => {
    const system = mockSystemScheme(true);
    useThemeStore.getState().setPreference('system');

    const { unmount } = renderHook(() => {
      useApplyTheme();
    });
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => {
      system.change(false);
    });
    expect(document.documentElement.dataset.theme).toBe('light');
    unmount();
  });
});
