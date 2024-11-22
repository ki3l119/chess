import React from "react";

import "./card.scss";

export type CardProps = {
  children?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ children }) => {
  return <div className="card">{children}</div>;
};
