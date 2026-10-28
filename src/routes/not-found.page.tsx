import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { ROUTES } from './routes.constants';

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada');

  return (
    <main>
      <h1>Página não encontrada</h1>
      <p>O endereço não existe ou foi removido.</p>
      <Link to={ROUTES.home}>Voltar para o início</Link>
    </main>
  );
}
