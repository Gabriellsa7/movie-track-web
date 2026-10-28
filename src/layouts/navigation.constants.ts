import { ROUTES } from '@/routes/routes.constants';

export const MAIN_NAVIGATION = [
  { label: 'Início', to: ROUTES.home, end: true },
  { label: 'Meus filmes', to: ROUTES.movies, end: false },
  { label: 'Quero assistir', to: ROUTES.watchlist, end: false },
  { label: 'Usuários', to: ROUTES.users, end: false },
  { label: 'Conta', to: ROUTES.account, end: false },
] as const;
