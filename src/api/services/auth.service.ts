import { apiClient } from '../client';
import type { TAuthTokens, TLoginBody, TResetPasswordBody } from '../types';

export async function login(body: TLoginBody): Promise<TAuthTokens> {
  const { data } = await apiClient.post<TAuthTokens>('/auth/login', body);
  return data;
}

export async function refreshTokens(
  refreshToken: string,
): Promise<TAuthTokens> {
  const { data } = await apiClient.post<TAuthTokens>(
    '/auth/refresh',
    { refreshToken },
    { skipAuthRefresh: true },
  );
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post(
    '/auth/logout',
    { refreshToken },
    { skipAuthRefresh: true },
  );
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post('/auth/verify-email', { token });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(body: TResetPasswordBody): Promise<void> {
  await apiClient.post('/auth/reset-password', body);
}
