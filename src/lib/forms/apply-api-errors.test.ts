import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/api-error';
import { applyApiErrors } from './apply-api-errors';

interface IForm {
  email: string;
  name: string;
  currentPassword: string;
}
const FIELDS = ['email', 'name', 'currentPassword'] as const;

describe('When we show API errors on a form', () => {
  it('should put validation errors on the matching fields', () => {
    const setError = vi.fn();
    const error = new ApiError({
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR',
      errors: [
        { field: 'email', message: 'should match format "email"' },
        { field: 'unknown', message: 'ignored' },
      ],
    });

    expect(applyApiErrors<IForm>(error, setError, FIELDS)).toBe(true);
    expect(setError).toHaveBeenCalledOnce();
    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'should match format "email"',
    });
  });

  it('should map a field-level domain code to its field', () => {
    const setError = vi.fn();
    const error = new ApiError({
      message: 'Taken',
      status: 409,
      code: 'EMAIL_TAKEN',
    });

    expect(applyApiErrors<IForm>(error, setError, FIELDS)).toBe(true);
    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Este e-mail já tem uma conta',
    });
  });

  it('should leave errors without a field to the caller', () => {
    const setError = vi.fn();

    expect(
      applyApiErrors<IForm>(
        new ApiError({
          message: 'Down',
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
        }),
        setError,
        FIELDS,
      ),
    ).toBe(false);
    expect(
      applyApiErrors<IForm>(
        new ApiError({ message: 'Bad', status: 422, code: 'INVALID_RATING' }),
        setError,
        FIELDS,
      ),
    ).toBe(false);
    expect(
      applyApiErrors<IForm>(
        new ApiError({ message: 'Bad', status: 400, code: 'VALIDATION_ERROR' }),
        setError,
        FIELDS,
      ),
    ).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
