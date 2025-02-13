import React, { useEffect, useRef } from "react";
import "./piece.scss";

import { PieceType } from "@/pages/game/utils/chess";

export type PieceProps = {
  type: PieceType;
};

export const Piece: React.FC<PieceProps> = ({ type }) => {
  return (
    <img
      className="chess-piece"
      draggable={false}
      src={`/pieces/${type.color.toLowerCase()}/${type.name.toLowerCase()}.svg`}
    />
  );
};
