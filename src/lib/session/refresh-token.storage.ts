const REFRESH_TOKEN_KEY = 'movie-track:refresh-token';

// Storage can throw (private mode, blocked site data); the session then lives only in memory.
export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeRefreshToken(refreshToken: string | null) {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Nothing to do: see readRefreshToken.
  }
}
