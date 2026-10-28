import { useEffect } from 'react';

const APP_NAME = 'Movie Track';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${APP_NAME} · ${title}` : APP_NAME;
  }, [title]);
}
