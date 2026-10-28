import { isAxiosError } from 'axios';
import { EApiErrorCode } from './error-codes';
import type { TApiErrorBody, TFieldError } from './types';

const UNKNOWN_ERROR_MESSAGE = 'Unexpected error';

export class ApiError extends Error {
  readonly status: number;
  readonly code: EApiErrorCode | (string & {});
  readonly fieldErrors: TFieldError[];

  constructor(body: TApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = body.status;
    this.code = body.code;
    this.fieldErrors = body.errors ?? [];
  }

  is(code: EApiErrorCode): boolean {
    return this.code === code;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    if (isAxiosError(error)) {
      if (error.response && isApiErrorBody(error.response.data)) {
        return new ApiError(error.response.data);
      }
      if (!error.response) {
        return new ApiError({
          message: error.message,
          status: 0,
          code: EApiErrorCode.NETWORK_ERROR,
        });
      }
      return new ApiError({
        message: error.message,
        status: error.response.status,
        code: EApiErrorCode.INTERNAL_ERROR,
      });
    }
    return new ApiError({
      message: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      status: 0,
      code: EApiErrorCode.INTERNAL_ERROR,
    });
  }
}

function isApiErrorBody(data: unknown): data is TApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as TApiErrorBody).code === 'string' &&
    typeof (data as TApiErrorBody).status === 'number'
  );
}
