import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { registerSessionHandlers } from '@/api/client';
import { queryClient } from '@/lib/react-query/query-client';
import { useSessionStore } from '@/stores/session.store';
import { server } from './msw/server';

const INITIAL_SESSION = useSessionStore.getState();

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  registerSessionHandlers(null);
  queryClient.clear();
  localStorage.clear();
  useSessionStore.setState(INITIAL_SESSION, true);
});

afterAll(() => {
  server.close();
});
