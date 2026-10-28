import type {
  TListMoviesQuery,
  TListUsersQuery,
  TListWatchlistQuery,
  TTmdbSearchQuery,
} from '@/api/types';

export const queryKeys = {
  genres: ['genres'] as const,
  account: (userId: string) => ['account', userId] as const,
  movies: {
    all: ['movies'] as const,
    list: (query: TListMoviesQuery) => ['movies', 'list', query] as const,
    detail: (movieId: string) => ['movies', 'detail', movieId] as const,
  },
  watchlist: {
    all: ['watchlist'] as const,
    list: (query: TListWatchlistQuery) => ['watchlist', 'list', query] as const,
  },
  users: {
    all: ['users'] as const,
    list: (query: TListUsersQuery) => ['users', 'list', query] as const,
    profile: (userId: string) => ['users', userId, 'profile'] as const,
    stats: (userId: string) => ['users', userId, 'stats'] as const,
    movies: (userId: string, query: TListMoviesQuery) =>
      ['users', userId, 'movies', query] as const,
    movie: (userId: string, movieId: string) =>
      ['users', userId, 'movies', 'detail', movieId] as const,
  },
  tmdb: {
    search: (query: TTmdbSearchQuery) => ['tmdb', 'search', query] as const,
  },
};
