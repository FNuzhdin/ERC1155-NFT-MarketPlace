import React from "react";

type SimpleButtonProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
};

const SimpleButton: React.FC<SimpleButtonProps> = ({
  disabled = false,
  onClick,
  children, 
  className = "small-black-button2",
}) => {
  return (<button
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>)
    
};

export default SimpleButton;
