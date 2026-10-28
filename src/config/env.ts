import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);
if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = {
  apiUrl: parsedEnv.data.VITE_API_URL,
};
