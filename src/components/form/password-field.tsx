import { useState, type ComponentPropsWithRef } from 'react';
import { Field } from './field';

type TPasswordFieldProps = Omit<
  ComponentPropsWithRef<'input'>,
  'id' | 'type'
> & {
  label: string;
  error?: string;
  hint?: string;
};

export function PasswordField({
  label,
  error,
  hint,
  ...inputProps
}: TPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <div>
          <input
            id={id}
            type={visible ? 'text' : 'password'}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            {...inputProps}
          />
          <button
            type="button"
            aria-pressed={visible}
            onClick={() => {
              setVisible((current) => !current);
            }}
          >
            {visible ? 'Ocultar senha' : 'Mostrar senha'}
          </button>
        </div>
      )}
    </Field>
  );
}
