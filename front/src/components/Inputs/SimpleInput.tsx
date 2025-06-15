import React from "react";

type SimpleInputProps = {
  placeholder: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  list?: string;
};

/**
 * SimpleInput component
 *
 * A reusable text input component for forms and user input throughout the project.
 *
 * Features:
 * - Renders a styled single-line text input.
 * - Supports placeholder, name, and value props for flexible use in forms.
 * - Handles value changes via the `onChange` callback.
 * - Can be disabled if needed.
 * - Supports the `list` prop for datalist/autocomplete functionality.
 * - Widely used across the project for consistent input appearance and behavior.
 *
 * Props:
 * - `placeholder` (string): Placeholder text for the input.
 * - `name` (string): Name attribute for the input (useful in forms).
 * - `value` (string): The current value of the input.
 * - `onChange` (React.ChangeEventHandler<HTMLInputElement>): Change event handler.
 * - `disabled` (boolean, optional): Whether the input is disabled.
 * - `list` (string, optional): ID of a datalist element for autocomplete suggestions.
 *
 * Example:
 * ```tsx
 * <SimpleInput
 *   placeholder="Enter your name"
 *   name="username"
 *   value={username}
 *   onChange={handleChange}
 *   disabled={false}
 * />
 * ```
 */

const SimpleInput: React.FC<SimpleInputProps> = ({
  placeholder,
  name,
  value,
  onChange,
  disabled,
  list,
}) => {
  return (
    <div>
      <input
        className="input-white-border"
        type="text"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        list={list}
      />
    </div>
  );
};

export default SimpleInput;
