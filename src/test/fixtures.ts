import type {
  TMovie,
  TUser,
  TWatchlistItem,
  TWatchlistPage,
} from '@/api/types';
import { ITEM_ID, MOVIE_ID, USER_ID } from './constants';

export const A_USER: TUser = {
  id: USER_ID,
  name: 'Gabriel',
  email: 'gabriel@email.com',
  emailVerified: false,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

export const A_MOVIE: TMovie = {
  id: MOVIE_ID,
  userId: USER_ID,
  title: 'Duna: Parte 2',
  synopsis: 'Paul Atreides se une aos Fremen.',
  releaseYear: 2024,
  genreIds: ['genre-1'],
  rating: 9,
  watchedAt: '2026-10-12T00:00:00.000Z',
  watchCount: 2,
  isFavorite: false,
  createdAt: '2026-10-12T00:00:00.000Z',
  updatedAt: '2026-10-12T00:00:00.000Z',
};

export const A_WATCHLIST_ITEM: TWatchlistItem = {
  id: ITEM_ID,
  userId: USER_ID,
  title: 'Perfect Days',
  priority: 'medium',
  addedAt: '2026-10-20T00:00:00.000Z',
};

export const A_WATCHLIST_PAGE: TWatchlistPage = {
  items: [A_WATCHLIST_ITEM],
  total: 1,
  page: 1,
  limit: 20,
};
