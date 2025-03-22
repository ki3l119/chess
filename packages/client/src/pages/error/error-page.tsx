import React from "react";
import { useNavigate } from "react-router";

import "./error-page.scss";
import { Button } from "@/components/button/button";

export type ErrorPageProps = {
  code: number;
  title: string;
  details: string;
  redirectButton: {
    displayText: string;
    redirectTo: string;
  };
};
export const ErrorPage: React.FC<ErrorPageProps> = ({
  code,
  title,
  details,
  redirectButton,
}) => {
  const navigate = useNavigate();
  const onButtonClick = () => {
    navigate(redirectButton.redirectTo);
  };
  return (
    <div className="error-page">
      <h1 className="error-page__code">{code}</h1>
      <h2 className="error-page__title">{title}</h2>
      <p className="error-page__details">{details}</p>
      <Button onClick={onButtonClick}>{redirectButton.displayText}</Button>
    </div>
  );
};
