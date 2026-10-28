import { useId, type ReactNode } from 'react';

interface IFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (control: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
}

// Label, hint and error wiring shared by every input; styling comes with the design system.
export function Field({ label, error, hint, children }: IFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div data-invalid={error ? true : undefined}>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && <p id={hintId}>{hint}</p>}
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
