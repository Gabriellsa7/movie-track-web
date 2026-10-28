export const ROUTES = {
  home: '/',
  login: '/login',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  movies: '/movies',
  newMovie: '/movies/new',
  movie: (movieId: string) => `/movies/${movieId}`,
  editMovie: (movieId: string) => `/movies/${movieId}/edit`,
  watchlist: '/watchlist',
  newWatchlistItem: '/watchlist/new',
  editWatchlistItem: (itemId: string) => `/watchlist/${itemId}/edit`,
  watchlistItemWatched: (itemId: string) => `/watchlist/${itemId}/watched`,
  users: '/users',
  user: (userId: string) => `/users/${userId}`,
  userMovie: (userId: string, movieId: string) =>
    `/users/${userId}/movies/${movieId}`,
  account: '/account',
} as const;

export const NEXT_PARAM = 'next';

// Only same-app paths, so ?next= can't send the user to another site.
export function safeNextPath(next: string | null): string {
  return next?.startsWith('/') && !next.startsWith('//') ? next : ROUTES.home;
}
