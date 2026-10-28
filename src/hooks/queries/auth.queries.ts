import { useMutation } from '@tanstack/react-query';
import * as authService from '@/api/services/auth.service';
import * as userService from '@/api/services/user.service';
import type { TLoginBody, TNewUserBody, TResetPasswordBody } from '@/api/types';
import { logout, startSession } from '@/lib/session/session';
import { useSessionStore } from '@/stores/session.store';

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (body: TLoginBody) => {
      await startSession(await authService.login(body));
    },
  });
}

// Sign-up returns the user but no tokens, so it logs in right after.
export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (body: TNewUserBody) => {
      await userService.signUp(body);
      await startSession(
        await authService.login({ email: body.email, password: body.password }),
      );
    },
  });
}

export function useLogoutMutation() {
  return useMutation({ mutationFn: logout });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (body: TResetPasswordBody) => authService.resetPassword(body),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: () => {
      const { userId } = useSessionStore.getState();
      if (!userId) {
        throw new Error('Not logged in');
      }
      return userService.resendEmailVerification(userId);
    },
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { userId } = useSessionStore.getState();
      if (!userId) {
        throw new Error('Not logged in');
      }
      await userService.deleteAccount(userId, password);
      await logout();
    },
  });
}
