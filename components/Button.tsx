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
      className="mt-1 rounded p-2 bg-indigo-500 text-white cursor-pointer"
      type="submit"
      disabled={props.disabled}
    >
      {props.loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 mr-3 ..."
            viewBox="0 0 24 24"
          ></svg>
          {props.loadingText}
        </>
      ) : (
        props.label
      )}
    </button>
  );
};

export default Button;
