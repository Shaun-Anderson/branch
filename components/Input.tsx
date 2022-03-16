import React, { InputHTMLAttributes, ChangeEvent } from "react";
import {
  useController,
  Control,
  UseFormRegister,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";

interface InputProps extends UseControllerProps<T> {
  label: string;
  placeholder?: string;
  register?: UseFormRegister<FieldValues>;
}
const Input = (props: InputProps) => {
  const { field, fieldState } = useController(props);
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          {...field}
          placeholder={props.placeholder}
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 sm:text-sm border border-gray-300 rounded-md"
        />
        {fieldState.error && <p>{fieldState.error.message}</p>}
      </div>
    </div>
  );
};

export default Input;
