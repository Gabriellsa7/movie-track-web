import { Link, Outlet } from 'react-router';
import { Logo } from '@/components/logo';
import { ROUTES } from '@/routes/routes.constants';
import { MainNavigation } from './main-navigation';

export function AppLayout() {
  return (
    <div>
      <a href="#main-content">Pular para o conteúdo</a>
      <aside>
        <Link to={ROUTES.home}>
          <Logo />
        </Link>
        <Link to={ROUTES.newMovie}>Registrar filme</Link>
        <MainNavigation variant="sidebar" />
      </aside>
      <main id="main-content">
        <Outlet />
      </main>
      <MainNavigation variant="bottom" />
    </div>
  );
}
