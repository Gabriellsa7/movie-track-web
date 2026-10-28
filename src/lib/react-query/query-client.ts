import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/api-error';

const STALE_TIME_MILLISECONDS = 30_000;
const MAX_RETRIES = 1;

// 4xx answers won't change on retry; network failures and 5xx get one more try.
function shouldRetry(failureCount: number, error: unknown): boolean {
  const { status } = ApiError.from(error);
  return failureCount < MAX_RETRIES && (status === 0 || status >= 500);
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MILLISECONDS,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
