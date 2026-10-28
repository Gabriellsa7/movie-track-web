import { apiClient } from '../client';
import type {
  TListMoviesQuery,
  TMovie,
  TMoviePage,
  TNewMovieBody,
  TRewatchMovieBody,
  TUpdateMovieBody,
} from '../types';

export async function listMovies(
  query: TListMoviesQuery = {},
): Promise<TMoviePage> {
  const { data } = await apiClient.get<TMoviePage>('/movies', {
    params: query,
  });
  return data;
}

export async function getMovie(movieId: string): Promise<TMovie> {
  const { data } = await apiClient.get<TMovie>(`/movies/${movieId}`);
  return data;
}

export async function createMovie(body: TNewMovieBody): Promise<TMovie> {
  const { data } = await apiClient.post<TMovie>('/movies', body);
  return data;
}

export async function updateMovie(
  movieId: string,
  body: TUpdateMovieBody,
): Promise<TMovie> {
  const { data } = await apiClient.put<TMovie>(`/movies/${movieId}`, body);
  return data;
}

export async function deleteMovie(movieId: string): Promise<void> {
  await apiClient.delete(`/movies/${movieId}`);
}

export async function setMovieFavorite(
  movieId: string,
  isFavorite: boolean,
): Promise<TMovie> {
  const { data } = await apiClient.patch<TMovie>(
    `/movies/${movieId}/favorite`,
    {
      isFavorite,
    },
  );
  return data;
}

export async function rewatchMovie(
  movieId: string,
  body: TRewatchMovieBody = {},
): Promise<TMovie> {
  const { data } = await apiClient.post<TMovie>(
    `/movies/${movieId}/rewatch`,
    body,
  );
  return data;
}

export async function uploadMoviePoster(
  movieId: string,
  poster: File,
): Promise<TMovie> {
  const formData = new FormData();
  formData.append('poster', poster);
  const { data } = await apiClient.put<TMovie>(
    `/movies/${movieId}/poster`,
    formData,
  );
  return data;
}

export async function removeMoviePoster(movieId: string): Promise<TMovie> {
  const { data } = await apiClient.delete<TMovie>(`/movies/${movieId}/poster`);
  return data;
}
