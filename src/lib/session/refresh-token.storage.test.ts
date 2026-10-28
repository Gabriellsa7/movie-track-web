import { describe, expect, it, vi } from 'vitest';
import { readRefreshToken, writeRefreshToken } from './refresh-token.storage';

describe('When we keep the refresh token', () => {
  it('should save, read and remove it', () => {
    writeRefreshToken('token');
    expect(readRefreshToken()).toBe('token');

    writeRefreshToken(null);
    expect(readRefreshToken()).toBeNull();
  });

  it('should not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => {
      writeRefreshToken('token');
    }).not.toThrow();
    expect(readRefreshToken()).toBeNull();
  });
});
