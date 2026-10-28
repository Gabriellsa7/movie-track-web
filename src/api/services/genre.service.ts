import { apiClient } from '../client';
import type { TGenre } from '../types';

export async function listGenres(): Promise<TGenre[]> {
  const { data } = await apiClient.get<TGenre[]>('/genres');
  return data;
}
