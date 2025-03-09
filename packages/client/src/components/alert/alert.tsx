import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faCircleInfo,
  faCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import "./alert.scss";

export type AlertProps = {
  message: string;
  type: "info" | "success" | "error" | "warning";
};

export const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const iconMap = {
    info: faCircleInfo,
    success: faCheck,
    error: faCircleExclamation,
    warning: faTriangleExclamation,
  };
  return (
    <div className={`alert alert--${type}`}>
      <FontAwesomeIcon icon={iconMap[type]} className="alert__icon" />
      <p>{message}</p>
    </div>
  );
};
