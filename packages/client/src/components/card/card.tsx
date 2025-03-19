import React from "react";

import "./card.scss";

export type CardProps = {
  children?: React.ReactNode;
  title?: string;
  /**
   * Wether the card should take full height of the container
   */
  fullHeight?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  fullHeight = false,
}) => {
  const cardClasses = ["card"];
  if (fullHeight) {
    cardClasses.push("card--full-height");
  }
  return (
    <div className={cardClasses.join(" ")}>
      {title && <h1 className="card__title">{title}</h1>}
      {children}
    </div>
  );
};
