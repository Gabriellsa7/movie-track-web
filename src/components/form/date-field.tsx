import type { ComponentPropsWithRef } from 'react';
import { TextField } from './text-field';

type TDateFieldProps = Omit<ComponentPropsWithRef<'input'>, 'id' | 'type'> & {
  label: string;
  error?: string;
  hint?: string;
};

// Native date input: its value is already YYYY-MM-DD, what the API expects.
export function DateField(props: TDateFieldProps) {
  return <TextField type="date" {...props} />;
}
