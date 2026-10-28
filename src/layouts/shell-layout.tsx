import { useSessionStore } from '@/stores/session.store';
import { AppLayout } from './app-layout';
import { PublicLayout } from './public-layout';

// Public screens (users, profiles, reviews) keep the app navigation for a logged user.
export function ShellLayout() {
  const status = useSessionStore((state) => state.status);
  return status === 'authenticated' ? <AppLayout /> : <PublicLayout />;
}
