import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { TMovie } from '@/api/types';
import { API_URL, MOVIE_ID } from '@/test/constants';
import { A_MOVIE } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { createTestQueryClient, createWrapper } from '@/test/render';
import {
  useCreateMovieMutation,
  useDeleteMovieMutation,
  useMovieQuery,
  useMoviesQuery,
  useRemovePosterMutation,
  useRewatchMovieMutation,
  useSetFavoriteMutation,
  useUpdateMovieMutation,
  useUploadPosterMutation,
} from './movie.queries';
import { queryKeys } from './query-keys';

const PAGE = { items: [A_MOVIE], total: 1, page: 1, limit: 20 };

describe('When we read my movies', () => {
  it('should load the list and one movie', async () => {
    server.use(
      http.get(`${API_URL}/movies`, () => HttpResponse.json(PAGE)),
      http.get(`${API_URL}/movies/${MOVIE_ID}`, () =>
        HttpResponse.json(A_MOVIE),
      ),
    );
    const wrapper = createWrapper();

    const list = renderHook(() => useMoviesQuery({ sort: 'rating' }), {
      wrapper,
    });
    const detail = renderHook(() => useMovieQuery(MOVIE_ID), { wrapper });

    await waitFor(() => {
      expect(list.result.current.data).toEqual(PAGE);
      expect(detail.result.current.data).toEqual(A_MOVIE);
    });
  });
});

describe('When we change my movies', () => {
  it('should create, update, rewatch, delete and change the poster, invalidating the lists', async () => {
    server.use(
      http.post(`${API_URL}/movies`, () =>
        HttpResponse.json(A_MOVIE, { status: 201 }),
      ),
      http.put(`${API_URL}/movies/${MOVIE_ID}`, () =>
        HttpResponse.json(A_MOVIE),
      ),
      http.post(`${API_URL}/movies/${MOVIE_ID}/rewatch`, () =>
        HttpResponse.json(A_MOVIE),
      ),
      http.delete(
        `${API_URL}/movies/${MOVIE_ID}`,
        () => new HttpResponse(null, { status: 204 }),
      ),
      http.put(`${API_URL}/movies/${MOVIE_ID}/poster`, () =>
        HttpResponse.json(A_MOVIE),
      ),
      http.delete(`${API_URL}/movies/${MOVIE_ID}/poster`, () =>
        HttpResponse.json(A_MOVIE),
      ),
    );
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.movies.list({}), PAGE);
    const wrapper = createWrapper(client);

    const { result } = renderHook(
      () => ({
        create: useCreateMovieMutation(),
        update: useUpdateMovieMutation(MOVIE_ID),
        rewatch: useRewatchMovieMutation(MOVIE_ID),
        remove: useDeleteMovieMutation(),
        upload: useUploadPosterMutation(MOVIE_ID),
        removePoster: useRemovePosterMutation(MOVIE_ID),
      }),
      { wrapper },
    );

    await act(async () => {
      await result.current.create.mutateAsync({
        title: 'T',
        synopsis: 'S',
        releaseYear: 2024,
        genreIds: ['g'],
        rating: 8,
      });
      await result.current.update.mutateAsync({
        title: 'T',
        synopsis: 'S',
        releaseYear: 2024,
        genreIds: ['g'],
        rating: 8.5,
      });
      await result.current.rewatch.mutateAsync(undefined);
      await result.current.upload.mutateAsync(
        new File(['x'], 'p.png', { type: 'image/png' }),
      );
      await result.current.removePoster.mutateAsync();
      await result.current.remove.mutateAsync(MOVIE_ID);
    });

    expect(client.getQueryState(queryKeys.movies.list({}))?.isInvalidated).toBe(
      true,
    );
  });
});

describe('When we mark a movie as favorite', () => {
  it('should flip the heart at once', async () => {
    let release: () => void = () => undefined;
    server.use(
      http.patch(`${API_URL}/movies/${MOVIE_ID}/favorite`, async () => {
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return HttpResponse.json({ ...A_MOVIE, isFavorite: true });
      }),
    );
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.movies.detail(MOVIE_ID), A_MOVIE);

    const { result } = renderHook(() => useSetFavoriteMutation(MOVIE_ID), {
      wrapper: createWrapper(client),
    });
    act(() => {
      result.current.mutate(true);
    });

    await waitFor(() => {
      expect(
        client.getQueryData<TMovie>(queryKeys.movies.detail(MOVIE_ID))
          ?.isFavorite,
      ).toBe(true);
    });
    release();
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should roll back when the API refuses', async () => {
    server.use(
      http.patch(`${API_URL}/movies/${MOVIE_ID}/favorite`, () =>
        HttpResponse.json(
          { message: 'Movie not found', status: 404, code: 'MOVIE_NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );
    const client = createTestQueryClient();
    client.setQueryData(queryKeys.movies.detail(MOVIE_ID), A_MOVIE);

    const { result } = renderHook(() => useSetFavoriteMutation(MOVIE_ID), {
      wrapper: createWrapper(client),
    });
    await act(async () => {
      await result.current.mutateAsync(true).catch(() => undefined);
    });

    expect(
      client.getQueryData<TMovie>(queryKeys.movies.detail(MOVIE_ID))
        ?.isFavorite,
    ).toBe(false);
  });
});
