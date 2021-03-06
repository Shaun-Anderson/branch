import { ChangeEvent } from "react";

interface InputProps {
  value?: string | number | readonly string[] | undefined;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute | undefined;
  onChange: (data: any) => void;
  required?: boolean;
}
const Input = (props: InputProps) => {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {props.label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          value={props.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.onChange(event.target.value)
          }
          required={props.required}
          type={props.type}
          placeholder={props.placeholder}
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 sm:text-sm border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default Input;
