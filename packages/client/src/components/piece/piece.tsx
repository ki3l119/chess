import React, { useEffect, useRef } from "react";
import "./piece.scss";

import { PieceType } from "@/pages/game/utils/chess";

export type PieceProps = {
  type: PieceType;
};

export const Piece: React.FC<PieceProps> = ({ type }) => {
  return (
    <div
      className={
        "chess-piece " +
        `chess-piece--${type.color.toLowerCase()}-${type.name.toLowerCase()}`
      }
    />
  );
};
