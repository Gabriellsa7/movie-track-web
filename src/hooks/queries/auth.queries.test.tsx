import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ACCESS_TOKEN, API_URL, USER_ID } from '@/test/constants';
import { A_USER } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { createWrapper } from '@/test/render';
import { readRefreshToken } from '@/lib/session/refresh-token.storage';
import { useSessionStore } from '@/stores/session.store';
import {
  useDeleteAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useSignUpMutation,
  useVerifyEmailMutation,
} from './auth.queries';

const TOKENS = { accessToken: ACCESS_TOKEN, refreshToken: 'refresh' };
const noContent = () => new HttpResponse(null, { status: 204 });

function renderAuthHooks() {
  return renderHook(
    () => ({
      login: useLoginMutation(),
      signUp: useSignUpMutation(),
      logout: useLogoutMutation(),
      verify: useVerifyEmailMutation(),
      forgot: useRequestPasswordResetMutation(),
      reset: useResetPasswordMutation(),
      resend: useResendVerificationMutation(),
      remove: useDeleteAccountMutation(),
    }),
    { wrapper: createWrapper() },
  );
}

describe('When we log in or sign up', () => {
  it('should start the session', async () => {
    server.use(
      http.post(`${API_URL}/users`, () =>
        HttpResponse.json(A_USER, { status: 201 }),
      ),
      http.post(`${API_URL}/auth/login`, () => HttpResponse.json(TOKENS)),
      http.get(`${API_URL}/users/${USER_ID}/account`, () =>
        HttpResponse.json(A_USER),
      ),
      http.post(`${API_URL}/auth/logout`, noContent),
    );
    const { result } = renderAuthHooks();

    await act(async () => {
      await result.current.signUp.mutateAsync({
        name: 'Gabriel',
        email: A_USER.email,
        password: 'filmes2026',
      });
    });
    expect(useSessionStore.getState().status).toBe('authenticated');

    await act(async () => {
      await result.current.logout.mutateAsync();
      await result.current.login.mutateAsync({
        email: A_USER.email,
        password: 'filmes2026',
      });
    });
    expect(useSessionStore.getState().user).toEqual(A_USER);
  });
});

describe('When we use the e-mail and password flows', () => {
  it('should call the API for each one', async () => {
    useSessionStore.setState({ userId: USER_ID });
    server.use(
      http.post(`${API_URL}/auth/verify-email`, noContent),
      http.post(`${API_URL}/auth/forgot-password`, noContent),
      http.post(`${API_URL}/auth/reset-password`, noContent),
      http.post(`${API_URL}/users/${USER_ID}/email-verification`, noContent),
    );
    const { result } = renderAuthHooks();

    await act(async () => {
      await result.current.verify.mutateAsync('token');
      await result.current.forgot.mutateAsync(A_USER.email);
      await result.current.reset.mutateAsync({
        token: 'token',
        newPassword: 'filmes2026',
      });
      await result.current.resend.mutateAsync();
    });

    await waitFor(() => {
      expect(result.current.resend.isSuccess).toBe(true);
    });
  });
});

describe('When we delete the account', () => {
  it('should delete it and end the session', async () => {
    useSessionStore.getState().setTokens(TOKENS);
    server.use(
      http.delete(`${API_URL}/users/${USER_ID}`, noContent),
      http.post(`${API_URL}/auth/logout`, noContent),
    );
    const { result } = renderAuthHooks();

    await act(async () => {
      await result.current.remove.mutateAsync('filmes2026');
    });

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(readRefreshToken()).toBeNull();
  });

  it('should refuse account actions without a session', async () => {
    const { result } = renderAuthHooks();

    await act(async () => {
      await expect(result.current.resend.mutateAsync()).rejects.toThrow(
        'Not logged in',
      );
      await expect(result.current.remove.mutateAsync('x')).rejects.toThrow(
        'Not logged in',
      );
    });
  });
});
