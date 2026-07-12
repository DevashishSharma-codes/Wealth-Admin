import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from './FormField';

describe('FormField - Wealth-Admin', () => {
  test('renders standard input field with label and placeholder', () => {
    render(
      <FormField
        label="Admin Name"
        placeholder="Enter your name"
        name="name"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Admin Name')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  test('displays red asterisk when required is true', () => {
    render(
      <FormField
        label="Required Field"
        name="requiredField"
        value=""
        required={true}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('triggers onChange event handler when user types', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="Typed Field"
        name="test"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Admin Text' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('displays error message text and applies error classes when error is present', () => {
    render(
      <FormField
        label="Error Field"
        name="errorField"
        value=""
        error="Invalid username"
        onChange={() => {}}
      />
    );

    const errorMsg = screen.getByText('Invalid username');
    expect(errorMsg).toBeInTheDocument();
    
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-rose-350');
  });

  test('handles null/undefined value gracefully without crashing', () => {
    render(
      <FormField
        label="Graceful Field"
        name="graceful"
        value={null}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input.value).toBe('');
  });

  test('renders right icon inside input area', () => {
    render(
      <FormField
        label="Icon Field"
        name="iconField"
        value=""
        rightIcon={<span data-testid="right-icon">👉</span>}
        onChange={() => {}}
      />
    );

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
