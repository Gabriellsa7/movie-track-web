import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useThemeStore } from '@/stores/theme.store';
import { Toaster } from './toaster';

describe('When we render the toaster', () => {
  it('should follow the theme preference', () => {
    useThemeStore.setState({ preference: 'light' });

    const { container } = render(<Toaster />);

    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
