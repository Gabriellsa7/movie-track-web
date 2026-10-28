import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoutes } from '@/test/render';
import { useSessionStore } from '@/stores/session.store';
import { ROUTES } from './routes.constants';
import { routes } from './router';

const PRIVATE_SCREENS: [string, string][] = [
  [ROUTES.home, 'Início'],
  [ROUTES.movies, 'Meus filmes'],
  [ROUTES.newMovie, 'Registrar filme'],
  [ROUTES.movie('m1'), 'Filme'],
  [ROUTES.editMovie('m1'), 'Registrar filme'],
  [ROUTES.watchlist, 'Quero assistir'],
  [ROUTES.newWatchlistItem, 'Adicionar à lista'],
  [ROUTES.editWatchlistItem('i1'), 'Adicionar à lista'],
  [ROUTES.watchlistItemWatched('i1'), 'Assisti'],
  [ROUTES.account, 'Conta'],
];

const PUBLIC_SCREENS: [string, string][] = [
  [ROUTES.login, 'Entrar'],
  [ROUTES.signUp, 'Criar conta'],
  [ROUTES.forgotPassword, 'Esqueci a senha'],
  [ROUTES.resetPassword, 'Nova senha'],
  [ROUTES.verifyEmail, 'Confirmar e-mail'],
  [ROUTES.users, 'Usuários'],
  [ROUTES.user('u1'), 'Perfil'],
  [ROUTES.userMovie('u1', 'm1'), 'Review'],
];

describe('When a logged user opens each private screen', () => {
  it.each(PRIVATE_SCREENS)('should render %s', async (path, title) => {
    useSessionStore.setState({ status: 'authenticated' });

    renderRoutes(routes, path);

    expect(
      await screen.findByRole('heading', { name: title }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('navigation', { name: 'Menu principal' }),
    ).toHaveLength(2);
  });
});

describe('When a visitor opens each public screen', () => {
  it.each(PUBLIC_SCREENS)('should render %s', async (path, title) => {
    useSessionStore.setState({ status: 'anonymous' });

    renderRoutes(routes, path);

    expect(
      await screen.findByRole('heading', { name: title }),
    ).toBeInTheDocument();
  });

  it('should show the public top bar on the users screen', async () => {
    useSessionStore.setState({ status: 'anonymous' });

    renderRoutes(routes, ROUTES.users);

    expect(
      await screen.findByRole('navigation', { name: 'Menu público' }),
    ).toBeInTheDocument();
  });
});

describe('When the address does not exist', () => {
  it('should render the not found page', async () => {
    renderRoutes(routes, '/nope');

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Movie Track · Página não encontrada');
  });
});
