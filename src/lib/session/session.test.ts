import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiClient } from '@/api/client';
import {
  API_URL,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  USER_ID,
} from '@/test/constants';
import { A_USER } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { useSessionStore } from '@/stores/session.store';
import { readRefreshToken, writeRefreshToken } from './refresh-token.storage';
import {
  bootstrapSession,
  logout,
  setUpSession,
  startSession,
} from './session';

const TOKENS = {
  accessToken: ACCESS_TOKEN,
  refreshToken: 'rotated-refresh-token',
};

function useRefreshAndAccount() {
  server.use(
    http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json(TOKENS)),
    http.get(`${API_URL}/users/${USER_ID}/account`, () =>
      HttpResponse.json(A_USER),
    ),
  );
}

describe('When the app starts', () => {
  it('should be anonymous without a stored refresh token', async () => {
    await bootstrapSession();

    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('should restore the session and load the account from a stored refresh token', async () => {
    writeRefreshToken(REFRESH_TOKEN);
    useRefreshAndAccount();

    await bootstrapSession();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: ACCESS_TOKEN,
      userId: USER_ID,
      user: A_USER,
    });
    expect(readRefreshToken()).toBe('rotated-refresh-token');
  });

  it('should forget a refresh token the API refuses', async () => {
    writeRefreshToken(REFRESH_TOKEN);
    server.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json(
          { message: 'Revoked', status: 401, code: 'TOKEN_REVOKED' },
          { status: 401 },
        ),
      ),
    );

    await bootstrapSession();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(readRefreshToken()).toBeNull();
  });
});

describe('When we log in and out', () => {
  it('should start the session with the tokens and the account', async () => {
    useRefreshAndAccount();

    await startSession(TOKENS);

    expect(useSessionStore.getState().user).toEqual(A_USER);
    expect(readRefreshToken()).toBe(TOKENS.refreshToken);
  });

  it('should revoke the refresh token and clear the session', async () => {
    useSessionStore.getState().setTokens(TOKENS);
    let revoked: unknown = null;
    server.use(
      http.post(`${API_URL}/auth/logout`, async ({ request }) => {
        revoked = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await logout();

    expect(revoked).toEqual({ refreshToken: TOKENS.refreshToken });
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('should clear the session even when the API can not revoke the token', async () => {
    useSessionStore.getState().setTokens(TOKENS);
    server.use(http.post(`${API_URL}/auth/logout`, () => HttpResponse.error()));

    await logout();

    expect(readRefreshToken()).toBeNull();
  });
});

describe('When a request finds the access token expired', () => {
  it('should refresh through the session and retry with the new token', async () => {
    setUpSession();
    useSessionStore.setState({ accessToken: 'old', userId: USER_ID });
    writeRefreshToken(REFRESH_TOKEN);
    server.use(
      http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json(TOKENS)),
      http.get(`${API_URL}/movies`, ({ request }) =>
        request.headers.get('Authorization') === `Bearer ${ACCESS_TOKEN}`
          ? HttpResponse.json({ items: [] })
          : HttpResponse.json(
              { message: 'Token expired', status: 401, code: 'TOKEN_EXPIRED' },
              { status: 401 },
            ),
      ),
    );

    const { data } = await apiClient.get<unknown>('/movies');

    expect(data).toEqual({ items: [] });
  });

  it('should end the session when there is no refresh token', async () => {
    setUpSession();
    useSessionStore.setState({ status: 'authenticated', accessToken: 'old' });
    server.use(
      http.get(`${API_URL}/movies`, () =>
        HttpResponse.json(
          { message: 'Token expired', status: 401, code: 'TOKEN_EXPIRED' },
          { status: 401 },
        ),
      ),
    );

    await expect(apiClient.get('/movies')).rejects.toMatchObject({
      code: 'INVALID_TOKEN',
    });
    expect(useSessionStore.getState().status).toBe('anonymous');
  });
});
