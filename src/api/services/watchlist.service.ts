import { apiClient } from '../client';
import type {
  TListWatchlistQuery,
  TMovie,
  TNewWatchlistItemBody,
  TUpdateWatchlistItemBody,
  TWatchlistItem,
  TWatchlistItemWatchedBody,
  TWatchlistPage,
} from '../types';

export async function listWatchlist(
  query: TListWatchlistQuery = {},
): Promise<TWatchlistPage> {
  const { data } = await apiClient.get<TWatchlistPage>('/watchlist', {
    params: query,
  });
  return data;
}

export async function addWatchlistItem(
  body: TNewWatchlistItemBody,
): Promise<TWatchlistItem> {
  const { data } = await apiClient.post<TWatchlistItem>('/watchlist', body);
  return data;
}

export async function updateWatchlistItem(
  itemId: string,
  body: TUpdateWatchlistItemBody,
): Promise<TWatchlistItem> {
  const { data } = await apiClient.put<TWatchlistItem>(
    `/watchlist/${itemId}`,
    body,
  );
  return data;
}

export async function removeWatchlistItem(itemId: string): Promise<void> {
  await apiClient.delete(`/watchlist/${itemId}`);
}

// "I watched it": creates the movie from the item and removes the item.
export async function markWatchlistItemWatched(
  itemId: string,
  body: TWatchlistItemWatchedBody,
): Promise<TMovie> {
  const { data } = await apiClient.post<TMovie>(
    `/watchlist/${itemId}/watched`,
    body,
  );
  return data;
}
