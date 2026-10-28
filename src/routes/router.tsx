import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { RootLayout } from '@/layouts/root-layout';
import { ShellLayout } from '@/layouts/shell-layout';
import { RedirectIfAuthenticated, RequireAuth } from './guards';
import { RouteErrorPage } from './route-error.page';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: 'login',
                lazy: async () => ({
                  Component: (await import('@/features/auth/pages/login.page'))
                    .LoginPage,
                }),
              },
              {
                path: 'sign-up',
                lazy: async () => ({
                  Component: (
                    await import('@/features/auth/pages/sign-up.page')
                  ).SignUpPage,
                }),
              },
              {
                path: 'forgot-password',
                lazy: async () => ({
                  Component: (
                    await import('@/features/auth/pages/forgot-password.page')
                  ).ForgotPasswordPage,
                }),
              },
            ],
          },
        ],
      },
      {
        // Opened from e-mail links, logged in or not.
        element: <AuthLayout />,
        children: [
          {
            path: 'reset-password',
            lazy: async () => ({
              Component: (
                await import('@/features/auth/pages/reset-password.page')
              ).ResetPasswordPage,
            }),
          },
          {
            path: 'verify-email',
            lazy: async () => ({
              Component: (
                await import('@/features/auth/pages/verify-email.page')
              ).VerifyEmailPage,
            }),
          },
        ],
      },
      {
        element: <ShellLayout />,
        children: [
          {
            path: 'users',
            lazy: async () => ({
              Component: (await import('@/features/users/pages/users.page'))
                .UsersPage,
            }),
          },
          {
            path: 'users/:userId',
            lazy: async () => ({
              Component: (
                await import('@/features/users/pages/user-profile.page')
              ).UserProfilePage,
            }),
          },
          {
            path: 'users/:userId/movies/:movieId',
            lazy: async () => ({
              Component: (
                await import('@/features/users/pages/user-review.page')
              ).UserReviewPage,
            }),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/home/pages/home.page'))
                    .HomePage,
                }),
              },
              {
                path: 'movies',
                lazy: async () => ({
                  Component: (
                    await import('@/features/movies/pages/movies.page')
                  ).MoviesPage,
                }),
              },
              {
                path: 'movies/new',
                lazy: async () => ({
                  Component: (
                    await import('@/features/movies/pages/movie-form.page')
                  ).MovieFormPage,
                }),
              },
              {
                path: 'movies/:movieId',
                lazy: async () => ({
                  Component: (
                    await import('@/features/movies/pages/movie-detail.page')
                  ).MovieDetailPage,
                }),
              },
              {
                path: 'movies/:movieId/edit',
                lazy: async () => ({
                  Component: (
                    await import('@/features/movies/pages/movie-form.page')
                  ).MovieFormPage,
                }),
              },
              {
                path: 'watchlist',
                lazy: async () => ({
                  Component: (
                    await import('@/features/watchlist/pages/watchlist.page')
                  ).WatchlistPage,
                }),
                children: [
                  {
                    path: 'new',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/watchlist/pages/watchlist-item-form.page')
                      ).WatchlistItemFormPage,
                    }),
                  },
                  {
                    path: ':itemId/edit',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/watchlist/pages/watchlist-item-form.page')
                      ).WatchlistItemFormPage,
                    }),
                  },
                  {
                    path: ':itemId/watched',
                    lazy: async () => ({
                      Component: (
                        await import('@/features/watchlist/pages/watchlist-watched.page')
                      ).WatchlistWatchedPage,
                    }),
                  },
                ],
              },
              {
                path: 'account',
                lazy: async () => ({
                  Component: (
                    await import('@/features/account/pages/account.page')
                  ).AccountPage,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('./not-found.page')).NotFoundPage,
        }),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
