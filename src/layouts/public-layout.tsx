import { Link, Outlet } from 'react-router';
import { Logo } from '@/components/logo';
import { ROUTES } from '@/routes/routes.constants';

export function PublicLayout() {
  return (
    <div>
      <header>
        <Link to={ROUTES.home}>
          <Logo />
        </Link>
        <nav aria-label="Menu público">
          <Link to={ROUTES.users}>Usuários</Link>
          <Link to={ROUTES.login}>Entrar</Link>
          <Link to={ROUTES.signUp}>Criar conta</Link>
        </nav>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
