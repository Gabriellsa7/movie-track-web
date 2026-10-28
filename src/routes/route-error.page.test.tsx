import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderRoutes } from '@/test/render';
import { RouteErrorPage } from './route-error.page';

function Broken(): never {
  throw new Error('render failed');
}

describe('When a screen fails to render', () => {
  it('should show the error page with a way back', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    renderRoutes([
      { path: '/', element: <Broken />, errorElement: <RouteErrorPage /> },
    ]);

    expect(
      screen.getByRole('heading', { name: 'Algo deu errado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para o início' }),
    ).toHaveAttribute('href', '/');
  });

  it('should explain a route answered with 404', async () => {
    renderRoutes([
      {
        path: '/',
        loader: () => {
          // React Router turns a thrown Response into a route error response.
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw new Response('Not found', { status: 404 });
        },
        element: null,
        errorElement: <RouteErrorPage />,
      },
    ]);

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
  });
});
