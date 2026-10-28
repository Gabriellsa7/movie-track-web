import { Link, Outlet } from 'react-router';
import { ROUTES } from '@/routes/routes.constants';

export function AuthLayout() {
  return (
    <div>
      <header>
        <Link to={ROUTES.home}>Movie Track</Link>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
