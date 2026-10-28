import '@fontsource-variable/inter';
import '@fontsource/bebas-neue';
import '@/styles/global.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app';
import { bootstrapSession, setUpSession } from '@/lib/session/session';
import { Providers } from '@/providers';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

setUpSession();
void bootstrapSession();

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
