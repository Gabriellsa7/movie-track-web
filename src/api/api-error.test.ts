import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError } from './api-error';
import { EApiErrorCode } from './error-codes';

function axiosErrorWith(status: number | undefined, data?: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    'Request failed',
    'ERR',
    config,
    undefined,
    status === undefined
      ? undefined
      : { status, statusText: '', headers: {}, config, data },
  );
}

describe('When we turn an API failure into an ApiError', () => {
  it('should keep the contract code, status and field errors', () => {
    const error = ApiError.from(
      axiosErrorWith(400, {
        message: 'Validation failed',
        status: 400,
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'email', message: 'invalid' }],
      }),
    );

    expect(error).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    expect(error.fieldErrors).toEqual([{ field: 'email', message: 'invalid' }]);
    expect(error.is(EApiErrorCode.VALIDATION_ERROR)).toBe(true);
  });

  it('should report NETWORK_ERROR when there is no response', () => {
    expect(ApiError.from(axiosErrorWith(undefined))).toMatchObject({
      status: 0,
      code: EApiErrorCode.NETWORK_ERROR,
    });
  });

  it('should report INTERNAL_ERROR for a body outside the contract', () => {
    expect(
      ApiError.from(axiosErrorWith(502, '<html>Bad gateway</html>')),
    ).toMatchObject({
      status: 502,
      code: EApiErrorCode.INTERNAL_ERROR,
    });
  });

  it('should return the same ApiError and wrap any other error', () => {
    const apiError = new ApiError({
      message: 'x',
      status: 404,
      code: 'MOVIE_NOT_FOUND',
    });

    expect(ApiError.from(apiError)).toBe(apiError);
    expect(ApiError.from(new Error('boom'))).toMatchObject({
      message: 'boom',
      code: EApiErrorCode.INTERNAL_ERROR,
    });
    expect(ApiError.from('weird')).toMatchObject({
      message: 'Unexpected error',
    });
  });
});
