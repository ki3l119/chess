import React from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import "./icon-button.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children"
> & {
  icon: IconDefinition;
  label?: string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  ...buttonProps
}) => {
  return (
    <div className="icon-button">
      <button {...buttonProps}>
        <FontAwesomeIcon icon={icon} />
      </button>
      {label && <p className="icon-button__label">{label}</p>}
    </div>
  );
};
