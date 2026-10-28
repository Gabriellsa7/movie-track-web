import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as watchlistService from '@/api/services/watchlist.service';
import type {
  TListWatchlistQuery,
  TNewWatchlistItemBody,
  TUpdateWatchlistItemBody,
  TWatchlistItemWatchedBody,
  TWatchlistPage,
} from '@/api/types';
import { queryKeys } from './query-keys';

export function useWatchlistQuery(query: TListWatchlistQuery) {
  return useQuery({
    queryKey: queryKeys.watchlist.list(query),
    queryFn: () => watchlistService.listWatchlist(query),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateWatchlist() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.watchlist.all });
}

export function useAddWatchlistItemMutation() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (body: TNewWatchlistItemBody) =>
      watchlistService.addWatchlistItem(body),
    onSuccess: invalidate,
  });
}

export function useRemoveWatchlistItemMutation() {
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (itemId: string) =>
      watchlistService.removeWatchlistItem(itemId),
    onSuccess: invalidate,
  });
}

// Optimistic on every cached page, so a priority change shows at once.
export function useUpdateWatchlistItemMutation(itemId: string) {
  const client = useQueryClient();
  const invalidate = useInvalidateWatchlist();
  return useMutation({
    mutationFn: (body: TUpdateWatchlistItemBody) =>
      watchlistService.updateWatchlistItem(itemId, body),
    onMutate: async (body) => {
      await client.cancelQueries({ queryKey: queryKeys.watchlist.all });
      const previous = client.getQueriesData<TWatchlistPage>({
        queryKey: queryKeys.watchlist.all,
      });
      if (body.priority) {
        const { priority } = body;
        client.setQueriesData<TWatchlistPage>(
          { queryKey: queryKeys.watchlist.all },
          (page) =>
            page && {
              ...page,
              items: page.items.map((item) =>
                item.id === itemId ? { ...item, priority } : item,
              ),
            },
        );
      }
      return { previous };
    },
    onError: (_error, _body, context) => {
      context?.previous.forEach(([key, page]) => {
        client.setQueryData(key, page);
      });
    },
    onSettled: invalidate,
  });
}

export function useMarkWatchedMutation(itemId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: TWatchlistItemWatchedBody) =>
      watchlistService.markWatchlistItemWatched(itemId, body),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.watchlist.all }),
        client.invalidateQueries({ queryKey: queryKeys.movies.all }),
        client.invalidateQueries({ queryKey: queryKeys.users.all }),
      ]),
  });
}
