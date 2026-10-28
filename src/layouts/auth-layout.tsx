import { Link, Outlet } from 'react-router';
import { Logo } from '@/components/logo';
import { ROUTES } from '@/routes/routes.constants';

export function AuthLayout() {
  return (
    <div>
      <header>
        <Link to={ROUTES.home}>
          <Logo />
        </Link>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
