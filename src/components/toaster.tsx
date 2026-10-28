import { Toaster as SonnerToaster } from 'sonner';
import { useThemeStore } from '@/stores/theme.store';

export function Toaster() {
  const preference = useThemeStore((state) => state.preference);

  return (
    <SonnerToaster
      theme={preference}
      position="bottom-center"
      closeButton
      toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
    />
  );
}
