import type { components, operations } from './schema';

type TSchemas = components['schemas'];
type TQuery<TOperation extends keyof operations> = NonNullable<
  operations[TOperation]['parameters']['query']
>;

export type TAuthTokens = TSchemas['AuthTokens'];
export type TLoginBody = TSchemas['Login'];
export type TResetPasswordBody = TSchemas['ResetPassword'];

export type TUser = TSchemas['User'];
export type TUserProfile = TSchemas['UserProfile'];
export type TUserSummary = TSchemas['UserSummary'];
export type TUserPage = TSchemas['UserPage'];
export type TUserStats = TSchemas['UserStats'];
export type TNewUserBody = TSchemas['NewUser'];
export type TUpdateUserBody = TSchemas['UpdateUser'];
export type TChangePasswordBody = TSchemas['ChangePassword'];
export type TListUsersQuery = TQuery<'getUsers'>;

export type TGenre = TSchemas['Genre'];

export type TMovie = TSchemas['Movie'];
export type TMoviePage = TSchemas['MoviePage'];
export type TNewMovieBody = TSchemas['NewMovie'];
export type TUpdateMovieBody = TSchemas['UpdateMovie'];
export type TRewatchMovieBody = TSchemas['MovieRewatch'];
export type TListMoviesQuery = TQuery<'getMovies'>;

export type TWatchlistItem = TSchemas['WatchlistItem'];
export type TWatchlistPage = TSchemas['WatchlistPage'];
export type TNewWatchlistItemBody = TSchemas['NewWatchlistItem'];
export type TUpdateWatchlistItemBody = TSchemas['UpdateWatchlistItem'];
export type TWatchlistItemWatchedBody = TSchemas['WatchlistItemWatched'];
export type TListWatchlistQuery = TQuery<'getWatchlist'>;

export type TTmdbMovie = TSchemas['MovieSearchResult'];
export type TTmdbMoviePage = TSchemas['MovieSearchPage'];
export type TTmdbSearchQuery = TQuery<'searchTmdbMovies'>;

export type TApiErrorBody = TSchemas['Error'];
export type TFieldError = TSchemas['FieldError'];
