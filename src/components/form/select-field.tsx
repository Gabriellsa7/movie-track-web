import type { ComponentPropsWithRef } from 'react';
import { Field } from './field';

interface ISelectOption {
  value: string;
  label: string;
}

type TSelectFieldProps = Omit<ComponentPropsWithRef<'select'>, 'id'> & {
  label: string;
  options: readonly ISelectOption[];
  error?: string;
  hint?: string;
};

export function SelectField({
  label,
  options,
  error,
  hint,
  ...selectProps
}: TSelectFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          {...selectProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
