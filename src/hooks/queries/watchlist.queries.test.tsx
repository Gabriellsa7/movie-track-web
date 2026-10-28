import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { TWatchlistPage } from '@/api/types';
import { API_URL, ITEM_ID } from '@/test/constants';
import { A_MOVIE, A_WATCHLIST_ITEM, A_WATCHLIST_PAGE } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { createTestQueryClient, createWrapper } from '@/test/render';
import { queryKeys } from './query-keys';
import {
  useAddWatchlistItemMutation,
  useMarkWatchedMutation,
  useRemoveWatchlistItemMutation,
  useUpdateWatchlistItemMutation,
  useWatchlistQuery,
} from './watchlist.queries';

const LIST_KEY = queryKeys.watchlist.list({ planned: true });

function seededClient() {
  const client = createTestQueryClient();
  client.setQueryData(LIST_KEY, A_WATCHLIST_PAGE);
  return client;
}

describe('When we read and change the watchlist', () => {
  it('should load, add, remove and mark an item as watched', async () => {
    server.use(
      http.get(`${API_URL}/watchlist`, () =>
        HttpResponse.json(A_WATCHLIST_PAGE),
      ),
      http.post(`${API_URL}/watchlist`, () =>
        HttpResponse.json(A_WATCHLIST_ITEM, { status: 201 }),
      ),
      http.delete(
        `${API_URL}/watchlist/${ITEM_ID}`,
        () => new HttpResponse(null, { status: 204 }),
      ),
      http.post(`${API_URL}/watchlist/${ITEM_ID}/watched`, () =>
        HttpResponse.json(A_MOVIE, { status: 201 }),
      ),
    );
    const client = seededClient();
    const wrapper = createWrapper(client);

    const list = renderHook(() => useWatchlistQuery({}), { wrapper });
    await waitFor(() => {
      expect(list.result.current.data).toEqual(A_WATCHLIST_PAGE);
    });

    const { result } = renderHook(
      () => ({
        add: useAddWatchlistItemMutation(),
        remove: useRemoveWatchlistItemMutation(),
        watched: useMarkWatchedMutation(ITEM_ID),
      }),
      { wrapper },
    );
    await act(async () => {
      await result.current.add.mutateAsync({ title: 'Perfect Days' });
      await result.current.remove.mutateAsync(ITEM_ID);
      await expect(
        result.current.watched.mutateAsync({ rating: 9 }),
      ).resolves.toEqual(A_MOVIE);
    });
  });
});

describe('When we change an item priority', () => {
  it('should show the new priority at once on every cached page', async () => {
    server.use(
      http.put(`${API_URL}/watchlist/${ITEM_ID}`, () =>
        HttpResponse.json({ ...A_WATCHLIST_ITEM, priority: 'high' }),
      ),
    );
    const client = seededClient();

    const { result } = renderHook(
      () => useUpdateWatchlistItemMutation(ITEM_ID),
      {
        wrapper: createWrapper(client),
      },
    );
    act(() => {
      result.current.mutate({ priority: 'high' });
    });

    await waitFor(() => {
      expect(
        client.getQueryData<TWatchlistPage>(LIST_KEY)?.items[0]?.priority,
      ).toBe('high');
    });
  });

  it('should roll back when the API refuses', async () => {
    server.use(
      http.put(`${API_URL}/watchlist/${ITEM_ID}`, () =>
        HttpResponse.json(
          {
            message: 'Not found',
            status: 404,
            code: 'WATCHLIST_ITEM_NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const client = seededClient();

    const { result } = renderHook(
      () => useUpdateWatchlistItemMutation(ITEM_ID),
      {
        wrapper: createWrapper(client),
      },
    );
    await act(async () => {
      await result.current
        .mutateAsync({ priority: 'high' })
        .catch(() => undefined);
    });

    expect(
      client.getQueryData<TWatchlistPage>(LIST_KEY)?.items[0]?.priority,
    ).toBe('medium');
  });

  it('should not touch the cache for a change without priority', async () => {
    server.use(
      http.put(`${API_URL}/watchlist/${ITEM_ID}`, () =>
        HttpResponse.json({ ...A_WATCHLIST_ITEM, note: 'x' }),
      ),
    );
    const client = seededClient();

    const { result } = renderHook(
      () => useUpdateWatchlistItemMutation(ITEM_ID),
      {
        wrapper: createWrapper(client),
      },
    );
    await act(async () => {
      await result.current.mutateAsync({ note: 'x' });
    });

    expect(
      client.getQueryData<TWatchlistPage>(LIST_KEY)?.items[0]?.priority,
    ).toBe('medium');
  });
});
