import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchTmdbMovies } from '@/api/services/tmdb.service';
import type { TTmdbSearchQuery } from '@/api/types';
import { queryKeys } from './query-keys';

const MIN_QUERY_LENGTH = 2;

// Pass an already debounced query; short queries don't hit TMDB.
export function useTmdbSearchQuery(query: TTmdbSearchQuery) {
  return useQuery({
    queryKey: queryKeys.tmdb.search(query),
    queryFn: () => searchTmdbMovies(query),
    enabled: query.query.trim().length >= MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
  });
}
