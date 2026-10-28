import { apiClient } from '../client';
import type {
  TChangePasswordBody,
  TListMoviesQuery,
  TListUsersQuery,
  TMovie,
  TMoviePage,
  TNewUserBody,
  TUpdateUserBody,
  TUser,
  TUserPage,
  TUserProfile,
  TUserStats,
} from '../types';

export async function signUp(body: TNewUserBody): Promise<TUser> {
  const { data } = await apiClient.post<TUser>('/users', body);
  return data;
}

export async function listUsers(
  query: TListUsersQuery = {},
): Promise<TUserPage> {
  const { data } = await apiClient.get<TUserPage>('/users', { params: query });
  return data;
}

export async function getUserProfile(userId: string): Promise<TUserProfile> {
  const { data } = await apiClient.get<TUserProfile>(`/users/${userId}`);
  return data;
}

export async function getAccount(userId: string): Promise<TUser> {
  const { data } = await apiClient.get<TUser>(`/users/${userId}/account`);
  return data;
}

export async function updateAccount(
  userId: string,
  body: TUpdateUserBody,
): Promise<TUser> {
  const { data } = await apiClient.put<TUser>(`/users/${userId}`, body);
  return data;
}

export async function changePassword(
  userId: string,
  body: TChangePasswordBody,
): Promise<void> {
  await apiClient.patch(`/users/${userId}/password`, body);
}

export async function deleteAccount(
  userId: string,
  password: string,
): Promise<void> {
  await apiClient.delete(`/users/${userId}`, { data: { password } });
}

export async function resendEmailVerification(userId: string): Promise<void> {
  await apiClient.post(`/users/${userId}/email-verification`);
}

export async function uploadAvatar(
  userId: string,
  avatar: File,
): Promise<TUser> {
  const formData = new FormData();
  formData.append('avatar', avatar);
  const { data } = await apiClient.put<TUser>(
    `/users/${userId}/avatar`,
    formData,
  );
  return data;
}

export async function removeAvatar(userId: string): Promise<TUser> {
  const { data } = await apiClient.delete<TUser>(`/users/${userId}/avatar`);
  return data;
}

export async function getUserStats(userId: string): Promise<TUserStats> {
  const { data } = await apiClient.get<TUserStats>(`/users/${userId}/stats`);
  return data;
}

export async function listUserMovies(
  userId: string,
  query: TListMoviesQuery = {},
): Promise<TMoviePage> {
  const { data } = await apiClient.get<TMoviePage>(`/users/${userId}/movies`, {
    params: query,
  });
  return data;
}

export async function getUserMovie(
  userId: string,
  movieId: string,
): Promise<TMovie> {
  const { data } = await apiClient.get<TMovie>(
    `/users/${userId}/movies/${movieId}`,
  );
  return data;
}
