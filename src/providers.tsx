import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';
import { Tooltip } from 'radix-ui';
import { Toaster } from '@/components/toaster';
import { queryClient } from '@/lib/react-query/query-client';
import { useApplyTheme } from '@/lib/theme/use-apply-theme';

// Dev-only, so the devtools stay out of the production bundle.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null;

export function Providers({ children }: { children: ReactNode }) {
  useApplyTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={300}>{children}</Tooltip.Provider>
      <Toaster />
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
