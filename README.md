# Movie Track — Web

Web app (desktop and mobile web) of **Movie Track**, a personal movie log: log
the movies you watched with a rating and a review, keep a watchlist of the next
ones, see your stats and browse other people's profiles.

It consumes the [Movie Track API](https://github.com/Gabriellsa7/movie-track).

## Stack

React 19 · Vite · TypeScript (strict) · SCSS modules · ESLint · Stylelint ·
Prettier · Husky + commitlint.

The `typescript` package is an alias of `@typescript/typescript6`, because
typescript-eslint still needs the TypeScript 6 API; `@typescript/native` is
TypeScript 7, which `tsc` (typecheck and build) runs.

## Requirements

- Node 24 (`.nvmrc`) and Yarn 1
- The API running on `http://localhost:3000` with
  `CORS_ORIGINS=http://localhost:5173`

## Getting started

```bash
yarn
cp .env.example .env   # VITE_API_URL, validated at startup
yarn dev               # http://localhost:5173
```

## API types

`src/api/schema.d.ts` is generated from the backend contract and committed;
never edit it by hand. With the backend repo cloned next to this one
(`../movie-track`), regenerate it after any contract change:

```bash
yarn gen:api
```

`src/api/types.ts` exposes friendly aliases (`TMovie`, `TUser`…), the
services in `src/api/services/` wrap each route, and every failure reaches the
app as an `ApiError` with the contract's `code` (`src/api/error-codes.ts`).

## Scripts

| Script                         | What it does                              |
| ------------------------------ | ----------------------------------------- |
| `yarn dev`                     | Dev server with HMR                       |
| `yarn build`                   | Typecheck and production build to `dist/` |
| `yarn preview`                 | Serve the production build                |
| `yarn typecheck`               | `tsc -b` (TypeScript 7)                   |
| `yarn lint` / `lint:fix`       | ESLint with type-aware rules              |
| `yarn lint:styles`             | Stylelint on `src/**/*.scss`              |
| `yarn format` / `format:check` | Prettier                                  |
| `yarn gen:api`                 | Regenerate `src/api/schema.d.ts`          |
| `yarn test` / `test:watch`     | Vitest                                    |
| `yarn test:coverage`           | Tests with the 80% coverage threshold     |

Before opening a PR:

```bash
yarn format:check && yarn lint && yarn lint:styles && yarn typecheck && yarn test:coverage && yarn build
```

## Styles

- Design tokens (colors for the dark and light themes, spacing, radius,
  z-index, durations) are CSS variables in `src/styles/_tokens.scss`; the theme
  is the `data-theme` attribute on `<html>`.
- One SCSS module per component (`movie-card.module.scss`), kebab-case classes
  read as camelCase (`styles.movieCard`). Use the breakpoints (`up(lg)`),
  `focus-ring` and `visually-hidden` from `src/styles/_mixins.scss` and the
  type mixins from `_typography.scss`.
- Inter and Bebas Neue are self-hosted through Fontsource.

## Tests

Vitest with jsdom, Testing Library and MSW. Test files sit next to the code
(`client.test.ts`), named `describe('When we …')` / `it('should …')`.

- `src/test/setup.ts` starts the MSW server (unhandled requests fail the test)
  and resets the session, the query cache and `localStorage` after each test.
- `src/test/render.tsx` renders with a fresh QueryClient (no retries) and a
  memory router: `renderRoutes(routes, '/movies')`.
- The jsdom page runs on the API origin (`http://api.test`), so the mocked
  calls are same-origin.

## Conventions

- Files in kebab-case (`movie-card.tsx`, `movie-card.module.scss`); components
  in PascalCase (`MovieCard`).
- Interfaces `I*`, type aliases `T*`, enums `E*`, constants `UPPER_SNAKE_CASE`.
- Code, comments and commits in English; UI texts in pt-BR.
- Conventional Commits, checked by commitlint on every commit.
- Imports from `src` use the `@/` alias.
