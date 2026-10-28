import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router';
import { createQueryClient } from '@/lib/react-query/query-client';

export function createTestQueryClient() {
  const client = createQueryClient();
  client.setDefaultOptions({
    queries: { retry: false, staleTime: Infinity },
    mutations: { retry: false },
  });
  return client;
}

export function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: createWrapper() });
}

export function renderRoutes(routes: RouteObject[], initialEntry = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  const view = render(<RouterProvider router={router} />, {
    wrapper: createWrapper(),
  });
  return { router, ...view };
}
