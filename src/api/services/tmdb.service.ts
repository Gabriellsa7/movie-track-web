import { apiClient } from '../client';
import type { TTmdbMoviePage, TTmdbSearchQuery } from '../types';

export async function searchTmdbMovies(
  query: TTmdbSearchQuery,
): Promise<TTmdbMoviePage> {
  const { data } = await apiClient.get<TTmdbMoviePage>('/tmdb/search', {
    params: query,
  });
  return data;
}
