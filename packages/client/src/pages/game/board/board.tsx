import React from "react";
import "./board.scss";

import {
  startingBoard,
  PieceType,
  coordinateToIndex,
  PieceColor,
  BoardPiece,
} from "@/pages/game/utils/chess";
import { Piece } from "@/components/piece/piece";

type BoardTileProps = {
  index: number;
  piece: null | PieceType;
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
  pieces?: BoardPiece[];
  perspective: PieceColor;
};

export const Board: React.FC<BoardProps> = ({
  pieces = startingBoard,
  perspective,
}) => {
  const board: (PieceType | null)[] = new Array(64).fill(null);
  for (const piece of pieces) {
    const boardIndex = coordinateToIndex(piece.coordinate);
    board[boardIndex] = piece.type;
  }
  const boardTiles = board.map((piece, index) => (
    <BoardTile
      key={`${index}-${piece ? `${piece.color}-${piece.name}` : "null"}`}
      index={index}
      piece={piece}
    />
  ));

  if (perspective === PieceColor.WHITE) {
    boardTiles.reverse();
  }
  return <div className="chess-board">{boardTiles}</div>;
};
