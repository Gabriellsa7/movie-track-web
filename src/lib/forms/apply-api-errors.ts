import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/api/api-error';
import { EApiErrorCode } from '@/api/error-codes';

// Domain errors that belong to one field, with the message shown under it.
const FIELD_ERRORS: Partial<
  Record<EApiErrorCode, { field: string; message: string }>
> = {
  [EApiErrorCode.EMAIL_TAKEN]: {
    field: 'email',
    message: 'Este e-mail já tem uma conta',
  },
  [EApiErrorCode.INVALID_CREDENTIALS]: {
    field: 'currentPassword',
    message: 'Senha incorreta',
  },
  [EApiErrorCode.CURRENT_PASSWORD_REQUIRED]: {
    field: 'currentPassword',
    message: 'Confirme sua senha para trocar o e-mail',
  },
  [EApiErrorCode.INVALID_RATING]: { field: 'rating', message: 'Nota inválida' },
  [EApiErrorCode.INVALID_RELEASE_YEAR]: {
    field: 'releaseYear',
    message: 'Ano inválido',
  },
  [EApiErrorCode.INVALID_WATCHED_AT]: {
    field: 'watchedAt',
    message: 'A data não pode estar no futuro',
  },
  [EApiErrorCode.INVALID_GENRE]: {
    field: 'genreIds',
    message: 'Gênero inválido',
  },
};

/**
 * Puts the API's errors on the form fields. Returns false when the error has no
 * field to show on, so the caller falls back to a toast.
 */
export function applyApiErrors<TFields extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFields>,
  fields: readonly Path<TFields>[],
): boolean {
  const apiError = ApiError.from(error);
  const isFormField = (field: string): field is Path<TFields> =>
    (fields as readonly string[]).includes(field);

  if (apiError.is(EApiErrorCode.VALIDATION_ERROR)) {
    const known = apiError.fieldErrors
      .map(({ field, message }) => ({
        field: field.split(/[./]/)[0] ?? field,
        message,
      }))
      .filter(({ field }) => isFormField(field));
    known.forEach(({ field, message }) => {
      setError(field as Path<TFields>, { type: 'server', message });
    });
    return known.length > 0;
  }

  const mapped = FIELD_ERRORS[apiError.code as EApiErrorCode];
  if (mapped && isFormField(mapped.field)) {
    setError(mapped.field, { type: 'server', message: mapped.message });
    return true;
  }
  return false;
}
