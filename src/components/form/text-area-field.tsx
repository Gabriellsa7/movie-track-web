import type { ComponentPropsWithRef } from 'react';
import { Field } from './field';

type TTextAreaFieldProps = Omit<ComponentPropsWithRef<'textarea'>, 'id'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextAreaField({
  label,
  error,
  hint,
  ...textAreaProps
}: TTextAreaFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          {...textAreaProps}
        />
      )}
    </Field>
  );
}
