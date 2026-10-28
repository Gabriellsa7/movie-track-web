import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_URL, MOVIE_ID, USER_ID } from '@/test/constants';
import { A_MOVIE, A_USER } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { createWrapper } from '@/test/render';
import { useSessionStore } from '@/stores/session.store';
import { useGenresQuery } from './genre.queries';
import { useTmdbSearchQuery } from './tmdb.queries';
import {
  useChangePasswordMutation,
  useRemoveAvatarMutation,
  useUpdateAccountMutation,
  useUploadAvatarMutation,
  useUserMovieQuery,
  useUserMoviesQuery,
  useUserProfileQuery,
  useUsersQuery,
  useUserStatsQuery,
} from './user.queries';

describe('When we read public data', () => {
  it('should load users, a profile, its stats, movies and one review', async () => {
    server.use(
      http.get(`${API_URL}/users`, () => HttpResponse.json({ items: [] })),
      http.get(`${API_URL}/users/${USER_ID}`, () =>
        HttpResponse.json({ id: USER_ID }),
      ),
      http.get(`${API_URL}/users/${USER_ID}/stats`, () =>
        HttpResponse.json({ totalMovies: 1 }),
      ),
      http.get(`${API_URL}/users/${USER_ID}/movies`, () =>
        HttpResponse.json({ items: [A_MOVIE] }),
      ),
      http.get(`${API_URL}/users/${USER_ID}/movies/${MOVIE_ID}`, () =>
        HttpResponse.json(A_MOVIE),
      ),
      http.get(`${API_URL}/genres`, () =>
        HttpResponse.json([{ id: 'g', name: 'Drama' }]),
      ),
      http.get(`${API_URL}/tmdb/search`, () =>
        HttpResponse.json({ items: [] }),
      ),
    );
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => ({
        users: useUsersQuery({}),
        profile: useUserProfileQuery(USER_ID),
        stats: useUserStatsQuery(USER_ID),
        movies: useUserMoviesQuery(USER_ID, {}),
        movie: useUserMovieQuery(USER_ID, MOVIE_ID),
        genres: useGenresQuery(),
        tmdb: useTmdbSearchQuery({ query: 'duna' }),
        tooShort: useTmdbSearchQuery({ query: 'd' }),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.users.isSuccess).toBe(true);
      expect(result.current.profile.isSuccess).toBe(true);
      expect(result.current.stats.isSuccess).toBe(true);
      expect(result.current.movies.isSuccess).toBe(true);
      expect(result.current.movie.data).toEqual(A_MOVIE);
      expect(result.current.genres.data).toHaveLength(1);
      expect(result.current.tmdb.isSuccess).toBe(true);
    });
    expect(result.current.tooShort.fetchStatus).toBe('idle');
  });
});

describe('When we change my account', () => {
  it('should keep the session user in sync', async () => {
    useSessionStore.setState({ userId: USER_ID, status: 'authenticated' });
    const updated = { ...A_USER, name: 'Gabi' };
    server.use(
      http.put(`${API_URL}/users/${USER_ID}`, () => HttpResponse.json(updated)),
      http.put(`${API_URL}/users/${USER_ID}/avatar`, () =>
        HttpResponse.json(updated),
      ),
      http.delete(`${API_URL}/users/${USER_ID}/avatar`, () =>
        HttpResponse.json(updated),
      ),
      http.patch(
        `${API_URL}/users/${USER_ID}/password`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderHook(
      () => ({
        update: useUpdateAccountMutation(),
        upload: useUploadAvatarMutation(),
        removeAvatar: useRemoveAvatarMutation(),
        password: useChangePasswordMutation(),
      }),
      { wrapper: createWrapper() },
    );
    await act(async () => {
      await result.current.update.mutateAsync({ name: 'Gabi' });
      await result.current.upload.mutateAsync(
        new File(['x'], 'a.png', { type: 'image/png' }),
      );
      await result.current.removeAvatar.mutateAsync(undefined);
      await result.current.password.mutateAsync({
        currentPassword: 'a',
        newPassword: 'b',
      });
    });

    expect(useSessionStore.getState().user).toEqual(updated);
  });

  it('should refuse without a session', async () => {
    const { result } = renderHook(
      () => ({
        update: useUpdateAccountMutation(),
        password: useChangePasswordMutation(),
      }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await expect(
        result.current.update.mutateAsync({ name: 'x' }),
      ).rejects.toThrow('Not logged in');
      await expect(
        result.current.password.mutateAsync({
          currentPassword: 'a',
          newPassword: 'b',
        }),
      ).rejects.toThrow('Not logged in');
    });
  });
});
