import React from "react";


type SimpleInputProps = {
  placeholder: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  list?: string;
};

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
