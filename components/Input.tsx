import React, { InputHTMLAttributes, ChangeEvent } from "react";

interface Props extends Omit<InputHTMLAttributes<any>, "onChange"> {
  className?: string;
  onChange: (value: string) => void;
}
const Input = (props: Props) => {
  const { className, children, onChange, ...rest } = props;
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    return null;
  };

  return (
    <label>
      <input
        className={
          "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" +
          className
        }
        onChange={handleOnChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        {...rest}
      />
    </label>
  );
};

export default Input;
