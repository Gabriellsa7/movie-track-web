import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_URL, ITEM_ID, MOVIE_ID, USER_ID } from '@/test/constants';
import { server } from '@/test/msw/server';
import * as auth from './auth.service';
import * as genre from './genre.service';
import * as movie from './movie.service';
import * as tmdb from './tmdb.service';
import * as user from './user.service';
import * as watchlist from './watchlist.service';

interface IRecordedRequest {
  method: string;
  url: string;
  body: unknown;
}

let recorded: IRecordedRequest | null = null;
// PUT /movies/{id} replaces the movie, so it takes the same required fields as POST.
const NEW_MOVIE = {
  title: 'T',
  synopsis: 'S',
  releaseYear: 2024,
  genreIds: ['g'],
  rating: 8,
};
const avatar = new File(['x'], 'avatar.png', { type: 'image/png' });

beforeEach(() => {
  recorded = null;
  server.use(
    http.all(`${API_URL}/*`, async ({ request }) => {
      const url = new URL(request.url);
      const contentType = request.headers.get('Content-Type') ?? '';
      let body: unknown = null;
      if (contentType.includes('multipart/form-data')) {
        // jsdom's multipart body can't go through request.formData(); read the part names.
        const text = await request.text();
        body = [...text.matchAll(/; name="([^"]+)"/g)].map((match) => match[1]);
      } else if (contentType.includes('application/json')) {
        body = await request.json();
      }
      recorded = {
        method: request.method,
        url: `${url.pathname}${url.search}`,
        body,
      };
      return HttpResponse.json({ ok: true });
    }),
  );
});

const CASES: [string, () => Promise<unknown>, IRecordedRequest][] = [
  [
    'login',
    () => auth.login({ email: 'a@b.com', password: 'x' }),
    {
      method: 'POST',
      url: '/auth/login',
      body: { email: 'a@b.com', password: 'x' },
    },
  ],
  [
    'refreshTokens',
    () => auth.refreshTokens('rt'),
    { method: 'POST', url: '/auth/refresh', body: { refreshToken: 'rt' } },
  ],
  [
    'logout',
    () => auth.logout('rt'),
    { method: 'POST', url: '/auth/logout', body: { refreshToken: 'rt' } },
  ],
  [
    'verifyEmail',
    () => auth.verifyEmail('tk'),
    { method: 'POST', url: '/auth/verify-email', body: { token: 'tk' } },
  ],
  [
    'requestPasswordReset',
    () => auth.requestPasswordReset('a@b.com'),
    {
      method: 'POST',
      url: '/auth/forgot-password',
      body: { email: 'a@b.com' },
    },
  ],
  [
    'resetPassword',
    () => auth.resetPassword({ token: 'tk', newPassword: 'abc12345' }),
    {
      method: 'POST',
      url: '/auth/reset-password',
      body: { token: 'tk', newPassword: 'abc12345' },
    },
  ],
  [
    'signUp',
    () => user.signUp({ name: 'G', email: 'a@b.com', password: 'abc12345' }),
    {
      method: 'POST',
      url: '/users',
      body: { name: 'G', email: 'a@b.com', password: 'abc12345' },
    },
  ],
  [
    'listUsers',
    () => user.listUsers({ search: 'ma', page: 2 }),
    { method: 'GET', url: '/users?search=ma&page=2', body: null },
  ],
  [
    'getUserProfile',
    () => user.getUserProfile(USER_ID),
    { method: 'GET', url: `/users/${USER_ID}`, body: null },
  ],
  [
    'getAccount',
    () => user.getAccount(USER_ID),
    { method: 'GET', url: `/users/${USER_ID}/account`, body: null },
  ],
  [
    'updateAccount',
    () => user.updateAccount(USER_ID, { name: 'G' }),
    { method: 'PUT', url: `/users/${USER_ID}`, body: { name: 'G' } },
  ],
  [
    'changePassword',
    () =>
      user.changePassword(USER_ID, { currentPassword: 'a', newPassword: 'b' }),
    {
      method: 'PATCH',
      url: `/users/${USER_ID}/password`,
      body: { currentPassword: 'a', newPassword: 'b' },
    },
  ],
  [
    'deleteAccount',
    () => user.deleteAccount(USER_ID, 'pw'),
    { method: 'DELETE', url: `/users/${USER_ID}`, body: { password: 'pw' } },
  ],
  [
    'resendEmailVerification',
    () => user.resendEmailVerification(USER_ID),
    { method: 'POST', url: `/users/${USER_ID}/email-verification`, body: null },
  ],
  [
    'uploadAvatar',
    () => user.uploadAvatar(USER_ID, avatar),
    { method: 'PUT', url: `/users/${USER_ID}/avatar`, body: ['avatar'] },
  ],
  [
    'removeAvatar',
    () => user.removeAvatar(USER_ID),
    { method: 'DELETE', url: `/users/${USER_ID}/avatar`, body: null },
  ],
  [
    'getUserStats',
    () => user.getUserStats(USER_ID),
    { method: 'GET', url: `/users/${USER_ID}/stats`, body: null },
  ],
  [
    'listUserMovies',
    () => user.listUserMovies(USER_ID, { favorite: true }),
    {
      method: 'GET',
      url: `/users/${USER_ID}/movies?favorite=true`,
      body: null,
    },
  ],
  [
    'getUserMovie',
    () => user.getUserMovie(USER_ID, MOVIE_ID),
    { method: 'GET', url: `/users/${USER_ID}/movies/${MOVIE_ID}`, body: null },
  ],
  [
    'listMovies',
    () => movie.listMovies({ sort: 'rating', order: 'desc' }),
    { method: 'GET', url: '/movies?sort=rating&order=desc', body: null },
  ],
  [
    'getMovie',
    () => movie.getMovie(MOVIE_ID),
    { method: 'GET', url: `/movies/${MOVIE_ID}`, body: null },
  ],
  [
    'createMovie',
    () =>
      movie.createMovie({
        title: 'T',
        synopsis: 'S',
        releaseYear: 2024,
        genreIds: ['g'],
        rating: 8,
      }),
    {
      method: 'POST',
      url: '/movies',
      body: {
        title: 'T',
        synopsis: 'S',
        releaseYear: 2024,
        genreIds: ['g'],
        rating: 8,
      },
    },
  ],
  [
    'updateMovie',
    () => movie.updateMovie(MOVIE_ID, { ...NEW_MOVIE, rating: 7.5 }),
    {
      method: 'PUT',
      url: `/movies/${MOVIE_ID}`,
      body: { ...NEW_MOVIE, rating: 7.5 },
    },
  ],
  [
    'deleteMovie',
    () => movie.deleteMovie(MOVIE_ID),
    { method: 'DELETE', url: `/movies/${MOVIE_ID}`, body: null },
  ],
  [
    'setMovieFavorite',
    () => movie.setMovieFavorite(MOVIE_ID, true),
    {
      method: 'PATCH',
      url: `/movies/${MOVIE_ID}/favorite`,
      body: { isFavorite: true },
    },
  ],
  [
    'rewatchMovie',
    () => movie.rewatchMovie(MOVIE_ID),
    { method: 'POST', url: `/movies/${MOVIE_ID}/rewatch`, body: {} },
  ],
  [
    'uploadMoviePoster',
    () => movie.uploadMoviePoster(MOVIE_ID, avatar),
    { method: 'PUT', url: `/movies/${MOVIE_ID}/poster`, body: ['poster'] },
  ],
  [
    'removeMoviePoster',
    () => movie.removeMoviePoster(MOVIE_ID),
    { method: 'DELETE', url: `/movies/${MOVIE_ID}/poster`, body: null },
  ],
  [
    'listWatchlist',
    () => watchlist.listWatchlist({ planned: true, sort: 'plannedFor' }),
    {
      method: 'GET',
      url: '/watchlist?planned=true&sort=plannedFor',
      body: null,
    },
  ],
  [
    'addWatchlistItem',
    () => watchlist.addWatchlistItem({ title: 'T' }),
    { method: 'POST', url: '/watchlist', body: { title: 'T' } },
  ],
  [
    'updateWatchlistItem',
    () => watchlist.updateWatchlistItem(ITEM_ID, { priority: 'high' }),
    { method: 'PUT', url: `/watchlist/${ITEM_ID}`, body: { priority: 'high' } },
  ],
  [
    'removeWatchlistItem',
    () => watchlist.removeWatchlistItem(ITEM_ID),
    { method: 'DELETE', url: `/watchlist/${ITEM_ID}`, body: null },
  ],
  [
    'markWatchlistItemWatched',
    () => watchlist.markWatchlistItemWatched(ITEM_ID, { rating: 9 }),
    {
      method: 'POST',
      url: `/watchlist/${ITEM_ID}/watched`,
      body: { rating: 9 },
    },
  ],
  [
    'searchTmdbMovies',
    () => tmdb.searchTmdbMovies({ query: 'duna', page: 1 }),
    { method: 'GET', url: '/tmdb/search?query=duna&page=1', body: null },
  ],
  [
    'listGenres',
    () => genre.listGenres(),
    { method: 'GET', url: '/genres', body: null },
  ],
];

describe('When we call each API service', () => {
  it.each(CASES)(
    'should send %s to the right route',
    async (_name, call, expected) => {
      await call();

      expect(recorded).toEqual(expected);
    },
  );
});
