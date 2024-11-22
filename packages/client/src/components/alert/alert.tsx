import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faCircleInfo,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import "./alert.scss";

export type AlertProps = {
  message: string;
  type: "info" | "success" | "error";
};

export const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const iconMap = {
    info: faCircleInfo,
    success: faCheck,
    error: faCircleExclamation,
  };
  return (
    <div className={`alert alert--${type}`}>
      <FontAwesomeIcon icon={iconMap[type]} className="alert__icon" />
      <p>{message}</p>
    </div>
  );
};
