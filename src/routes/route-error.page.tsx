import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { ROUTES } from './routes.constants';

export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  useDocumentTitle(notFound ? 'Página não encontrada' : 'Algo deu errado');

  return (
    <main>
      <h1>{notFound ? 'Página não encontrada' : 'Algo deu errado'}</h1>
      <p>
        {notFound
          ? 'O endereço não existe ou foi removido.'
          : 'Tente recarregar a página. Se continuar, volte mais tarde.'}
      </p>
      <Link to={ROUTES.home}>Voltar para o início</Link>
    </main>
  );
}
