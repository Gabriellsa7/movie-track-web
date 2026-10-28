import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Same origin as the API, so jsdom's XHR doesn't apply CORS to the mocked calls.
      environmentOptions: { jsdom: { url: 'http://api.test' } },
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      env: { VITE_API_URL: 'http://api.test' },
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.d.ts',
          'src/test/**',
          'src/main.tsx',
        ],
        thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      },
    },
  }),
);
