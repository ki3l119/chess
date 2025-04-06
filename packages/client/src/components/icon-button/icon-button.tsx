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
  color?: "primary" | "grey";
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  color = "primary",
  ...buttonProps
}) => {
  const classes = ["icon-button"];

  if (color === "grey") {
    classes.push("icon-button--grey");
  }

  return (
    <div className={classes.join(" ")}>
      <button {...buttonProps}>
        <FontAwesomeIcon icon={icon} className="icon-button__icon" />
      </button>
      {label && <p className="icon-button__label">{label}</p>}
    </div>
  );
};
