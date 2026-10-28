import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { API_URL } from '@/test/constants';
import { server } from '@/test/msw/server';
import {
  apiClient,
  registerSessionHandlers,
  type ISessionHandlers,
} from './client';

const expired = () =>
  HttpResponse.json(
    { message: 'Token expired', status: 401, code: 'TOKEN_EXPIRED' },
    { status: 401 },
  );

function handlersWith(overrides: Partial<ISessionHandlers> = {}) {
  const handlers: ISessionHandlers = {
    getAccessToken: vi.fn(() => 'old-token'),
    refreshAccessToken: vi.fn(() => Promise.resolve('new-token')),
    onSessionExpired: vi.fn(),
    ...overrides,
  };
  registerSessionHandlers(handlers);
  return handlers;
}

// Answers 401 TOKEN_EXPIRED to the old token and 200 to the refreshed one.
function useProtectedRoute() {
  server.use(
    http.get(`${API_URL}/protected`, ({ request }) =>
      request.headers.get('Authorization') === 'Bearer new-token'
        ? HttpResponse.json({ ok: true })
        : expired(),
    ),
  );
}

describe('When the client calls the API', () => {
  it('should send the access token as a bearer token', async () => {
    handlersWith();
    let authorization: string | null = null;
    server.use(
      http.get(`${API_URL}/movies`, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );

    await apiClient.get('/movies');

    expect(authorization).toBe('Bearer old-token');
  });

  it('should send no token without a session', async () => {
    let authorization: string | null = 'unset';
    server.use(
      http.get(`${API_URL}/genres`, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json([]);
      }),
    );

    await apiClient.get('/genres');

    expect(authorization).toBeNull();
  });
});

describe('When the access token expired', () => {
  it('should refresh once for concurrent requests and retry them', async () => {
    const handlers = handlersWith();
    useProtectedRoute();

    const results = await Promise.all([
      apiClient.get<unknown>('/protected'),
      apiClient.get<unknown>('/protected'),
    ]);

    expect(results.map((result) => result.data)).toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(handlers.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('should end the session when the refresh is refused', async () => {
    const handlers = handlersWith({
      refreshAccessToken: () =>
        apiClient
          .post('/auth/refresh', {}, { skipAuthRefresh: true })
          .then(() => 'never'),
    });
    useProtectedRoute();
    server.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json(
          { message: 'Revoked', status: 401, code: 'TOKEN_REVOKED' },
          { status: 401 },
        ),
      ),
    );

    await expect(apiClient.get('/protected')).rejects.toMatchObject({
      code: 'TOKEN_REVOKED',
    });
    expect(handlers.onSessionExpired).toHaveBeenCalledOnce();
  });

  it('should keep the session when the refresh fails for a network reason', async () => {
    const handlers = handlersWith({
      refreshAccessToken: () => Promise.reject(new Error('offline')),
    });
    useProtectedRoute();

    await expect(apiClient.get('/protected')).rejects.toMatchObject({
      message: 'offline',
    });
    expect(handlers.onSessionExpired).not.toHaveBeenCalled();
  });

  it('should not refresh a request that opted out', async () => {
    const handlers = handlersWith();
    server.use(http.post(`${API_URL}/auth/refresh`, expired));

    await expect(
      apiClient.post('/auth/refresh', {}, { skipAuthRefresh: true }),
    ).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    expect(handlers.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('should not refresh without session handlers', async () => {
    useProtectedRoute();

    await expect(apiClient.get('/protected')).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
    });
  });
});

describe('When the API answers another error', () => {
  it('should reject with the ApiError and not refresh', async () => {
    const handlers = handlersWith();
    server.use(
      http.get(`${API_URL}/movies/x`, () =>
        HttpResponse.json(
          { message: 'Movie not found', status: 404, code: 'MOVIE_NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );

    await expect(apiClient.get('/movies/x')).rejects.toMatchObject({
      status: 404,
      code: 'MOVIE_NOT_FOUND',
    });
    expect(handlers.refreshAccessToken).not.toHaveBeenCalled();
  });
});
