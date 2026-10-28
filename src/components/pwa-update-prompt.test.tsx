import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaUpdatePrompt } from './pwa-update-prompt';

const mocks = vi.hoisted(() => ({
  needRefresh: false,
  updateServiceWorker: vi.fn(() => Promise.resolve()),
  toast: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: mocks.toast }));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mocks.needRefresh, vi.fn()],
    updateServiceWorker: mocks.updateServiceWorker,
  }),
}));

interface IUpdateToastOptions {
  action: { label: string; onClick: () => void };
}

beforeEach(() => {
  mocks.needRefresh = false;
  mocks.toast.mockClear();
  mocks.updateServiceWorker.mockClear();
});

describe('When the app checks for a new version', () => {
  it('should stay quiet while there is none', () => {
    render(<PwaUpdatePrompt />);

    expect(mocks.toast).not.toHaveBeenCalled();
  });

  it('should offer to reload, and reload only when asked', () => {
    mocks.needRefresh = true;

    render(<PwaUpdatePrompt />);

    expect(mocks.toast).toHaveBeenCalledOnce();
    const [message, options] = mocks.toast.mock.calls[0] as [
      string,
      IUpdateToastOptions,
    ];
    expect(message).toBe('Nova versão disponível');
    expect(mocks.updateServiceWorker).not.toHaveBeenCalled();

    options.action.onClick();
    expect(mocks.updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
