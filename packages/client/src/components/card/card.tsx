import React from "react";

import "./card.scss";

export type CardProps = {
  children?: React.ReactNode;
  title?: string;
};

export const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div className="card">
      {title && <h1 className="card__title">{title}</h1>}
      {children}
    </div>
  );
};
