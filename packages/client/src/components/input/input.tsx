import React, { forwardRef } from "react";

import "./input.scss";
export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = forwardRef<
  HTMLInputElement,
  InputProps
>(({ label, error, ...inputProps }, ref) => {
  const inputElementClasses = ["input__element"];

  if (error) {
    inputElementClasses.push("input__element--error");
  }
  const inputElement = (
    <>
      <input
        className={inputElementClasses.join(" ")}
        {...inputProps}
        ref={ref}
      />
      {error && <p className="input__error">{error}</p>}
    </>
  );

  return (
    <div className="input">
      {label !== undefined ? (
        <label className="input__label">
          {label}
          {inputElement}
        </label>
      ) : (
        inputElement
      )}
    </div>
  );
});
