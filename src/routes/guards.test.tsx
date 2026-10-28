import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoutes } from '@/test/render';
import { useSessionStore } from '@/stores/session.store';
import { RedirectIfAuthenticated, RequireAuth } from './guards';
import { safeNextPath } from './routes.constants';

const ROUTES = [
  {
    element: <RequireAuth />,
    children: [{ path: '/movies', element: <h1>Movies</h1> }],
  },
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: '/login', element: <h1>Login</h1> }],
  },
  { path: '/', element: <h1>Home</h1> },
];

describe('When an anonymous user opens a private screen', () => {
  it('should send them to the login with the path to come back to', () => {
    useSessionStore.setState({ status: 'anonymous' });

    const { router } = renderRoutes(ROUTES, '/movies?favorite=true');

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(router.state.location.search).toBe(
      `?next=${encodeURIComponent('/movies?favorite=true')}`,
    );
  });

  it('should wait while the session is loading', () => {
    useSessionStore.setState({ status: 'loading' });

    renderRoutes(ROUTES, '/movies');

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
  });
});

describe('When a logged user opens the login', () => {
  it('should send them to the next path', () => {
    useSessionStore.setState({ status: 'authenticated' });

    renderRoutes(ROUTES, '/login?next=%2Fmovies');

    expect(screen.getByRole('heading', { name: 'Movies' })).toBeInTheDocument();
  });

  it('should wait while the session is loading', () => {
    useSessionStore.setState({ status: 'loading' });

    renderRoutes(ROUTES, '/login');

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('When we read the next path', () => {
  it('should only accept paths inside the app', () => {
    expect(safeNextPath('/movies?page=2')).toBe('/movies?page=2');
    expect(safeNextPath('//evil.example')).toBe('/');
    expect(safeNextPath('https://evil.example')).toBe('/');
    expect(safeNextPath(null)).toBe('/');
  });
});
