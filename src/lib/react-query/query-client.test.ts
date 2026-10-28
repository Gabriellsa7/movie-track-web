import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { API_URL } from '@/test/constants';
import { server } from '@/test/msw/server';
import { createQueryClient } from './query-client';

function failWith(status: number, code: string) {
  return () => HttpResponse.json({ message: code, status, code }, { status });
}

async function fetchWithClient(path: string) {
  const client = createQueryClient();
  await client
    .query({
      queryKey: [path],
      queryFn: () => apiClient.get(path),
      retryDelay: 0,
    })
    .catch(() => undefined);
}

describe('When a query fails', () => {
  it('should retry a 5xx once', async () => {
    let calls = 0;
    server.use(
      http.get(`${API_URL}/flaky`, () => {
        calls += 1;
        return failWith(500, 'INTERNAL_ERROR')();
      }),
    );

    await fetchWithClient('/flaky');

    expect(calls).toBe(2);
  });

  it('should not retry a 4xx', async () => {
    let calls = 0;
    server.use(
      http.get(`${API_URL}/missing`, () => {
        calls += 1;
        return failWith(404, 'MOVIE_NOT_FOUND')();
      }),
    );

    await fetchWithClient('/missing');

    expect(calls).toBe(1);
  });

  it('should show one toast for a temporary failure', async () => {
    const toastError = vi.spyOn(toast, 'error');
    server.use(
      http.get(`${API_URL}/down`, failWith(503, 'SERVICE_UNAVAILABLE')),
    );

    await fetchWithClient('/down');

    expect(toastError).toHaveBeenCalledWith(
      'Serviço indisponível no momento. Tente de novo em instantes.',
      { id: 'temporary-failure' },
    );
  });

  it('should explain a network failure and stay quiet on other errors', async () => {
    const toastError = vi.spyOn(toast, 'error');
    server.use(
      http.get(`${API_URL}/offline`, () => HttpResponse.error()),
      http.get(`${API_URL}/forbidden`, failWith(403, 'FORBIDDEN_RESOURCE')),
    );

    await fetchWithClient('/offline');
    await fetchWithClient('/forbidden');

    expect(toastError).toHaveBeenCalledOnce();
    expect(toastError).toHaveBeenCalledWith(
      'Sem conexão com o servidor. Confira sua internet.',
      { id: 'temporary-failure' },
    );
  });
});
