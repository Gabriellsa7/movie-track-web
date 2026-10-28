import { Outlet } from 'react-router';
import { PagePlaceholder } from '@/components/page-placeholder';

// The add, edit and "Assisti" dialogs are child routes rendered over the list.
export function WatchlistPage() {
  return (
    <PagePlaceholder title="Quero assistir">
      <Outlet />
    </PagePlaceholder>
  );
}
