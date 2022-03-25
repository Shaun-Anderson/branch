import React from "react";
import { useController, UseControllerProps } from "react-hook-form";

interface ButtonProps {
  label: string;
  loadingText?: string;
  loading?: boolean;
  disabled: boolean;

  type: "button" | "reset" | "submit" | undefined;
}
const Button = (props: ButtonProps) => {
  return (
    <button
      className="inline-flex items-center justify-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-300"
      type="submit"
      disabled={props.disabled}
    >
      {props.loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {props.loadingText}
        </>
      ) : (
        props.label
      )}
    </button>
  );
};

export default Button;
