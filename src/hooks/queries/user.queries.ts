import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as userService from '@/api/services/user.service';
import type {
  TChangePasswordBody,
  TListMoviesQuery,
  TListUsersQuery,
  TUpdateUserBody,
  TUser,
} from '@/api/types';
import { useSessionStore } from '@/stores/session.store';
import { queryKeys } from './query-keys';

export function useUsersQuery(query: TListUsersQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.listUsers(query),
    placeholderData: keepPreviousData,
  });
}

export function useUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => userService.getUserProfile(userId),
  });
}

export function useUserStatsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.stats(userId),
    queryFn: () => userService.getUserStats(userId),
  });
}

export function useUserMoviesQuery(userId: string, query: TListMoviesQuery) {
  return useQuery({
    queryKey: queryKeys.users.movies(userId, query),
    queryFn: () => userService.listUserMovies(userId, query),
    placeholderData: keepPreviousData,
  });
}

export function useUserMovieQuery(userId: string, movieId: string) {
  return useQuery({
    queryKey: queryKeys.users.movie(userId, movieId),
    queryFn: () => userService.getUserMovie(userId, movieId),
  });
}

// Account changes return the private user: keep the session copy in sync.
function useAccountMutation<TVariables>(
  mutationFn: (userId: string, variables: TVariables) => Promise<TUser>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => {
      const { userId } = useSessionStore.getState();
      if (!userId) {
        throw new Error('Not logged in');
      }
      return mutationFn(userId, variables);
    },
    onSuccess: async (user) => {
      useSessionStore.getState().setUser(user);
      await client.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateAccountMutation() {
  return useAccountMutation((userId, body: TUpdateUserBody) =>
    userService.updateAccount(userId, body),
  );
}

export function useUploadAvatarMutation() {
  return useAccountMutation((userId, avatar: File) =>
    userService.uploadAvatar(userId, avatar),
  );
}

export function useRemoveAvatarMutation() {
  return useAccountMutation((userId) => userService.removeAvatar(userId));
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (body: TChangePasswordBody) => {
      const { userId } = useSessionStore.getState();
      if (!userId) {
        throw new Error('Not logged in');
      }
      return userService.changePassword(userId, body);
    },
  });
}
