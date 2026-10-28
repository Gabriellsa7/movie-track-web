import { ApiError } from '@/api/api-error';
import { registerSessionHandlers } from '@/api/client';
import { EApiErrorCode } from '@/api/error-codes';
import * as authService from '@/api/services/auth.service';
import * as userService from '@/api/services/user.service';
import type { TAuthTokens } from '@/api/types';
import { queryClient } from '@/lib/react-query/query-client';
import { useSessionStore } from '@/stores/session.store';
import { readRefreshToken } from './refresh-token.storage';

export function setUpSession() {
  registerSessionHandlers({
    getAccessToken: () => useSessionStore.getState().accessToken,
    refreshAccessToken,
    onSessionExpired: () => {
      endSession();
    },
  });
}

// On app start: a stored refresh token brings the session back after a reload.
export async function bootstrapSession() {
  if (!readRefreshToken()) {
    useSessionStore.getState().clear();
    return;
  }
  try {
    await refreshAccessToken();
    await loadAccount();
  } catch {
    useSessionStore.getState().clear();
  }
}

export async function startSession(tokens: TAuthTokens) {
  useSessionStore.getState().setTokens(tokens);
  await loadAccount();
}

export async function logout() {
  const refreshToken = readRefreshToken();
  if (refreshToken) {
    // The device forgets the session even if the API can't revoke the token now.
    await authService.logout(refreshToken).catch(() => undefined);
  }
  endSession();
}

function endSession() {
  useSessionStore.getState().clear();
  queryClient.clear();
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    throw new ApiError({
      message: 'No session',
      status: 401,
      code: EApiErrorCode.INVALID_TOKEN,
    });
  }
  const tokens = await authService.refreshTokens(refreshToken);
  useSessionStore.getState().setTokens(tokens);
  return tokens.accessToken;
}

async function loadAccount() {
  const { userId, setUser } = useSessionStore.getState();
  if (!userId) {
    throw new Error('Session without a user id');
  }
  setUser(await userService.getAccount(userId));
}
