import React, { forwardRef } from "react";

import "./select.scss";

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "className"
> & {
  label?: string;
  error?: string;
  selectOptions: { display: string; value: string }[];
};

export const Select: React.FC<SelectProps> = forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ selectOptions, label, error, ...selectProps }, ref) => {
  const selectElementClasses = ["select__element"];

  if (error) {
    selectElementClasses.push("select__element--error");
  }

  const selectElement = (
    <>
      <select
        className={selectElementClasses.join(" ")}
        {...selectProps}
        ref={ref}
      >
        {selectOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.display}
          </option>
        ))}
      </select>
      {error && <p className="select__error">{error}</p>}
    </>
  );
  return (
    <div className="select">
      {label ? (
        <label className="select__label">
          {label}
          {selectElement}
        </label>
      ) : (
        selectElement
      )}
    </div>
  );
});
