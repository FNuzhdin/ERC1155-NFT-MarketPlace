import React from "react";

type SimpleErrorProps = {
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
};

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
