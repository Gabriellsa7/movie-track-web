import { useQuery } from '@tanstack/react-query';
import { listGenres } from '@/api/services/genre.service';
import { queryKeys } from './query-keys';

export function useGenresQuery() {
  return useQuery({
    queryKey: queryKeys.genres,
    queryFn: listGenres,
    // The genre list is a fixed seed on the backend.
    staleTime: Infinity,
  });
}
