import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/api/api-error';
import { EApiErrorCode } from '@/api/error-codes';

const STALE_TIME_MILLISECONDS = 30_000;
const MAX_RETRIES = 1;

// Temporary failures get one global message; screens only handle the errors they can explain.
const TEMPORARY_FAILURE_CODES: readonly string[] = [
  EApiErrorCode.SERVICE_UNAVAILABLE,
  EApiErrorCode.STORAGE_UNAVAILABLE,
  EApiErrorCode.EMAIL_UNAVAILABLE,
  EApiErrorCode.NETWORK_ERROR,
];
const TEMPORARY_FAILURE_TOAST_ID = 'temporary-failure';

function notifyTemporaryFailure(error: unknown) {
  const { code } = ApiError.from(error);
  if (TEMPORARY_FAILURE_CODES.includes(code)) {
    toast.error(
      code === EApiErrorCode.NETWORK_ERROR
        ? 'Sem conexão com o servidor. Confira sua internet.'
        : 'Serviço indisponível no momento. Tente de novo em instantes.',
      { id: TEMPORARY_FAILURE_TOAST_ID },
    );
  }
}

// 4xx answers won't change on retry; network failures and 5xx get one more try.
function shouldRetry(failureCount: number, error: unknown): boolean {
  const { status } = ApiError.from(error);
  return failureCount < MAX_RETRIES && (status === 0 || status >= 500);
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: notifyTemporaryFailure }),
    mutationCache: new MutationCache({ onError: notifyTemporaryFailure }),
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
