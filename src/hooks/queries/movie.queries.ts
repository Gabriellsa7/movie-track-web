import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as movieService from '@/api/services/movie.service';
import type {
  TListMoviesQuery,
  TMovie,
  TNewMovieBody,
  TRewatchMovieBody,
  TUpdateMovieBody,
} from '@/api/types';
import { queryKeys } from './query-keys';

export function useMoviesQuery(query: TListMoviesQuery) {
  return useQuery({
    queryKey: queryKeys.movies.list(query),
    queryFn: () => movieService.listMovies(query),
    placeholderData: keepPreviousData,
  });
}

export function useMovieQuery(movieId: string) {
  return useQuery({
    queryKey: queryKeys.movies.detail(movieId),
    queryFn: () => movieService.getMovie(movieId),
  });
}

// Any change to my movies also changes my stats and my public profile.
function useInvalidateMyMovies() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.movies.all }),
      client.invalidateQueries({ queryKey: queryKeys.users.all }),
    ]);
}

export function useCreateMovieMutation() {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: (body: TNewMovieBody) => movieService.createMovie(body),
    onSuccess: invalidate,
  });
}

export function useUpdateMovieMutation(movieId: string) {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: (body: TUpdateMovieBody) =>
      movieService.updateMovie(movieId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteMovieMutation() {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: (movieId: string) => movieService.deleteMovie(movieId),
    onSuccess: invalidate,
  });
}

export function useRewatchMovieMutation(movieId: string) {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: (body?: TRewatchMovieBody) =>
      movieService.rewatchMovie(movieId, body),
    onSuccess: invalidate,
  });
}

export function useUploadPosterMutation(movieId: string) {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: (poster: File) =>
      movieService.uploadMoviePoster(movieId, poster),
    onSuccess: invalidate,
  });
}

export function useRemovePosterMutation(movieId: string) {
  const invalidate = useInvalidateMyMovies();
  return useMutation({
    mutationFn: () => movieService.removeMoviePoster(movieId),
    onSuccess: invalidate,
  });
}

// Optimistic: the heart flips at once and rolls back if the API refuses.
export function useSetFavoriteMutation(movieId: string) {
  const client = useQueryClient();
  const invalidate = useInvalidateMyMovies();
  const detailKey = queryKeys.movies.detail(movieId);
  return useMutation({
    mutationFn: (isFavorite: boolean) =>
      movieService.setMovieFavorite(movieId, isFavorite),
    onMutate: async (isFavorite) => {
      await client.cancelQueries({ queryKey: detailKey });
      const previous = client.getQueryData<TMovie>(detailKey);
      if (previous) {
        client.setQueryData<TMovie>(detailKey, { ...previous, isFavorite });
      }
      return { previous };
    },
    onError: (_error, _isFavorite, context) => {
      if (context?.previous) {
        client.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: invalidate,
  });
}
