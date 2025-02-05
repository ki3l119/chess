import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import "./game-modal.scss";
import { Card, CardProps } from "@/components/card/card";

export type GameModalProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  icon?: {
    iconDefinition: IconDefinition;
    position: "right" | "left";
    onClick?: () => void;
  };
} & Pick<CardProps, "title">;

export const GameModal: React.FC<GameModalProps> = ({
  children,
  isOpen,
  title,
  icon,
}) => {
  return (
    <>
      {isOpen && (
        <div className="game-modal">
          <div className="game-modal__window">
            {icon && (
              <FontAwesomeIcon
                icon={icon.iconDefinition}
                className={`game-modal__icon game-modal__icon--${icon.position}`}
                onClick={icon.onClick}
              />
            )}

            <Card title={title}>{children}</Card>
          </div>
        </div>
      )}
    </>
  );
};
