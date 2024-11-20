import React from "react";
import "./board.scss";

import { BoardPiece } from "../../utils/chess";
import { Piece } from "../piece/piece";

type BoardTileProps = {
  index: number;
  piece: BoardPiece;
};

const BoardTile: React.FC<BoardTileProps> = ({ index, piece }) => {
  const rowIndex = Math.floor(index / 8);
  let boardBlockModifier = "chess-board__block--";

  if (rowIndex % 2 == 0) {
    boardBlockModifier += index % 2 == 0 ? "light" : "dark";
  } else {
    boardBlockModifier += index % 2 == 0 ? "dark" : "light";
  }

  return (
    <div className={`chess-board__block ${boardBlockModifier}`}>
      {piece && <Piece type={piece} />}
    </div>
  );
};

export type BoardProps = {
  board: BoardPiece[];
};

export const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <div className="chess-board">
      {board.map((piece, index) => (
        <BoardTile
          key={`${index}-${piece ? `${piece.color}-${piece.name}` : "null"}`}
          index={index}
          piece={piece}
        />
      ))}
    </div>
  );
};
