import React from "react";
import { useController, UseControllerProps } from "react-hook-form";

interface FormInputProps extends UseControllerProps {
  label: string;
  placeholder?: string;
  type: React.HTMLInputTypeAttribute | undefined;
}
const FormInput = (props: FormInputProps) => {
  const { field, fieldState } = useController(props);
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={props.type}
          {...field}
          placeholder={props.placeholder}
          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 sm:text-sm border ${
            fieldState.error ? "border-red-300" : "border-gray-300"
          } rounded-md`}
        />
      </div>
      {fieldState.error && (
        <p className="my-1 text-red-400 text-sm">{fieldState.error.message}</p>
      )}
    </div>
  );
};

export default FormInput;
