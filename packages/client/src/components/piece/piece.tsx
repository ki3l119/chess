import React from "react";
import "./piece.scss";

import { PieceType } from "../../utils/chess";

export type PieceProps = {
  type: PieceType;
};

export const Piece: React.FC<PieceProps> = ({ type }) => {
  const pieceImgSrc = new URL(
    `../../public/pieces/${type.color}/${type.name}.svg`,
    import.meta.url,
  );

  return (
    <img
      className="chess-piece chess-piece--interctable"
      draggable={false}
      src={pieceImgSrc.href}
    />
  );
};
