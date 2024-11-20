import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import "./button.scss";

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> & {
  /**
   * An optional icon to be placed at the left side within the button.
   */
  icon?: IconDefinition;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  ...htmlButtonProps
}) => {
  return (
    <button className="button" {...htmlButtonProps}>
      {icon && <FontAwesomeIcon className="button__icon" icon={icon} />}
      {children}
    </button>
  );
};
