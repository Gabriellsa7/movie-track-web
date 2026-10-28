import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { SessionSplash } from '@/components/session-splash';
import { useSessionStore } from '@/stores/session.store';
import { NEXT_PARAM, ROUTES, safeNextPath } from './routes.constants';

export function RequireAuth() {
  const status = useSessionStore((state) => state.status);
  const location = useLocation();

  if (status === 'loading') {
    return <SessionSplash />;
  }
  if (status === 'anonymous') {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${ROUTES.login}?${NEXT_PARAM}=${next}`} replace />;
  }
  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const status = useSessionStore((state) => state.status);
  const [searchParams] = useSearchParams();

  if (status === 'loading') {
    return <SessionSplash />;
  }
  if (status === 'authenticated') {
    return <Navigate to={safeNextPath(searchParams.get(NEXT_PARAM))} replace />;
  }
  return <Outlet />;
}
