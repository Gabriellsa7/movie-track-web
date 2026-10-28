import type { ComponentPropsWithRef } from 'react';
import { Field } from './field';

type TTextFieldProps = Omit<ComponentPropsWithRef<'input'>, 'id'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  ...inputProps
}: TTextFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          {...inputProps}
        />
      )}
    </Field>
  );
}
