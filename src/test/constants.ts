export const API_URL = 'http://api.test';
export const USER_ID = '64b7f0c2a1b2c3d4e5f60718';
export const MOVIE_ID = '64b7f0c2a1b2c3d4e5f60719';
export const ITEM_ID = '64b7f0c2a1b2c3d4e5f6071a';

// A JWT whose payload is { "sub": USER_ID }; the client only decodes it.
export const ACCESS_TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  btoa(JSON.stringify({ sub: USER_ID })).replace(/=+$/, ''),
  'signature',
].join('.');
export const REFRESH_TOKEN = 'refresh-token';
