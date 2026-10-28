import axios from 'axios';
import { env } from '@/config/env';
import { ApiError } from './api-error';
import { EApiErrorCode } from './error-codes';

const REQUEST_TIMEOUT_MILLISECONDS = 15_000;

declare module 'axios' {
  interface AxiosRequestConfig {
    // Set on the refresh call itself, so a failed refresh doesn't trigger another one.
    skipAuthRefresh?: boolean;
  }
  interface InternalAxiosRequestConfig {
    retriedAfterRefresh?: boolean;
  }
}

export interface ISessionHandlers {
  getAccessToken: () => string | null;
  // Exchanges the stored refresh token and resolves with the new access token.
  refreshAccessToken: () => Promise<string>;
  onSessionExpired: () => void;
}

let sessionHandlers: ISessionHandlers | null = null;
let refreshInFlight: Promise<string> | null = null;

export function registerSessionHandlers(handlers: ISessionHandlers | null) {
  sessionHandlers = handlers;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MILLISECONDS,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = sessionHandlers?.getAccessToken();
  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  const apiError = ApiError.from(error);
  const config = axios.isAxiosError(error) ? error.config : undefined;
  const handlers = sessionHandlers;

  const canRefresh =
    apiError.is(EApiErrorCode.TOKEN_EXPIRED) &&
    config !== undefined &&
    !config.skipAuthRefresh &&
    !config.retriedAfterRefresh &&
    handlers !== null;
  if (!canRefresh) {
    throw apiError;
  }

  let accessToken: string;
  try {
    // Concurrent 401s share one refresh: the refresh token rotates, so a second call would fail.
    refreshInFlight ??= handlers.refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    accessToken = await refreshInFlight;
  } catch (refreshError) {
    const refreshApiError = ApiError.from(refreshError);
    if (refreshApiError.status === 401) {
      handlers.onSessionExpired();
    }
    throw refreshApiError;
  }

  config.retriedAfterRefresh = true;
  config.headers.set('Authorization', `Bearer ${accessToken}`);
  return apiClient.request(config);
});
