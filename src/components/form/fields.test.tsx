import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DateField } from './date-field';
import { PasswordField } from './password-field';
import { SelectField } from './select-field';
import { TextAreaField } from './text-area-field';
import { TextField } from './text-field';

describe('When we render the form fields', () => {
  it('should link the label, the hint and the error to the input', () => {
    render(
      <TextField
        label="E-mail"
        hint="Usado no login"
        error="Informe um e-mail válido"
      />,
    );

    const input = screen.getByLabelText('E-mail');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Usado no login Informe um e-mail válido',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Informe um e-mail válido',
    );
  });

  it('should leave a valid field without aria-invalid or description', () => {
    render(<TextAreaField label="Opinião" />);

    const textArea = screen.getByLabelText('Opinião');
    expect(textArea).not.toHaveAttribute('aria-invalid');
    expect(textArea).not.toHaveAttribute('aria-describedby');
  });

  it('should toggle the password visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Senha" />);

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('should render a native date input and the select options', () => {
    render(
      <>
        <DateField label="Assisti em" />
        <SelectField
          label="Ordenar"
          options={[
            { value: 'rating', label: 'Maior nota' },
            { value: 'title', label: 'Título' },
          ]}
        />
      </>,
    );

    expect(screen.getByLabelText('Assisti em')).toHaveAttribute('type', 'date');
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Maior nota', 'Título']);
  });
});
