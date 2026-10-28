import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo, LogoMark } from './logo';
import { SessionSplash } from './session-splash';

describe('When we render the logo', () => {
  it('should read as the app name and hide the drawing from screen readers', () => {
    const { container } = render(<Logo />);

    expect(screen.getByText('Movie Track')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('should draw the mark at the size asked', () => {
    const { container } = render(<LogoMark size={72} />);

    expect(container.querySelector('svg')).toHaveAttribute('width', '72');
  });
});

describe('When the session is being restored', () => {
  it('should show the mark with a loading status', () => {
    render(<SessionSplash />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });
});
