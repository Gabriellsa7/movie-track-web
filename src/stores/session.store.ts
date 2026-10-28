import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import type { TAuthTokens, TUser } from '@/api/types';
import { writeRefreshToken } from '@/lib/session/refresh-token.storage';

export type TSessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface ISessionState {
  status: TSessionStatus;
  // Kept in memory only; the refresh token is what survives a reload.
  accessToken: string | null;
  userId: string | null;
  user: TUser | null;
  setTokens: (tokens: TAuthTokens) => void;
  setUser: (user: TUser) => void;
  clear: () => void;
}

export const useSessionStore = create<ISessionState>()((set) => ({
  status: 'loading',
  accessToken: null,
  userId: null,
  user: null,
  setTokens: ({ accessToken, refreshToken }) => {
    writeRefreshToken(refreshToken);
    set({ accessToken, userId: jwtDecode(accessToken).sub ?? null });
  },
  setUser: (user) => {
    set({ user, status: 'authenticated' });
  },
  clear: () => {
    writeRefreshToken(null);
    set({ status: 'anonymous', accessToken: null, userId: null, user: null });
  },
}));
