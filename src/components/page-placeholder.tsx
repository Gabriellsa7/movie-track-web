import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';

// Stands in for each screen until it is built from the approved mockups.
export function PagePlaceholder({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  useDocumentTitle(title);

  return (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  );
}
