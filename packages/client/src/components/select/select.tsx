import React, { forwardRef } from "react";

import "./select.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

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
    <div className="select__element-wrapper">
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
      <FontAwesomeIcon icon={faChevronDown} className="select__arrow" />
    </div>
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
      {error && <p className="select__error">{error}</p>}
    </div>
  );
});
