import React from "react";

type SimpleErrorProps = {
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/**
 * SimpleError component
 *
 * A minimal and universal component for displaying error messages with the option to hide them.
 *
 * Features:
 * - Shows the error text if provided via the `error` prop.
 * - "skip" button allows the user to clear the error (sets `error` to undefined).
 * - Widely used across the project for consistent error handling.
 *
 * Props:
 * - `error`: string | undefined — error message to display. If undefined, nothing is rendered.
 * - `setError`: function to clear the error (typically from useState).
 *
 * Example:
 * ```tsx
 * <SimpleError error={error} setError={setError} />
 * ```
 */

const SimpleError: React.FC<SimpleErrorProps> = ({ error, setError }) => {
  
  return (
    error && (
      <div>
        <p className="simple-error-message">{error} </p>
        <button
          className="small-black-button2"
          onClick={() => {
            setError(undefined);
          }}
        >
          skip
        </button>
      </div>
    )
  );
};

export default SimpleError;
