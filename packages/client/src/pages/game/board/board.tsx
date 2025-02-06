import React, { useState } from "react";
import "./board.scss";

import {
  startingBoard,
  PieceType,
  coordinateToIndex,
  PieceColor,
  BoardPiece,
  isCoordinateEqual,
  indexToCoordinate,
} from "../utils/chess";
import { Piece } from "@/components/piece/piece";
import { BoardCoordinateDto, MoveDto } from "chess-shared-types";

type BoardTileProps = {
  index: number;
  piece: null | PieceType;
  movablePiece: boolean;
  mark?: boolean;
  /**
   * Called when the user moves the piece occupying the tile.
   */
  onPieceMoveStart?: (coordinate: BoardCoordinateDto) => void;
  /**
   * Called once the user stops moving the piece occupying the tile.
   */
  onPieceMoveEnd?: () => void;
};

const BoardTile: React.FC<BoardTileProps> = ({
  index,
  piece,
  movablePiece,
  mark = false,
  onPieceMoveStart,
  onPieceMoveEnd,
}) => {
  const coordinate = indexToCoordinate(index);
  let tileModifier: string;
  if (coordinate.rank % 2 == 0) {
    tileModifier = index % 2 == 0 ? "light" : "dark";
  } else {
    tileModifier = index % 2 == 0 ? "dark" : "light";
  }

  const onMoveStart = () => {
    if (onPieceMoveStart) {
      onPieceMoveStart(coordinate);
    }
  };

  return (
    <div className={`chess-board__tile chess-board__tile--${tileModifier}`}>
      {piece && (
        <Piece
          type={piece}
          movable={movablePiece}
          onMoveStart={onMoveStart}
          onMoveEnd={onPieceMoveEnd}
        />
      )}
      {mark && (
        <div
          className={`chess-board__tile-mark chess-board__tile-mark--${tileModifier}`}
        ></div>
      )}
    </div>
  );
};

export type BoardProps = {
  /**
   * The location of each pieces in the board.
   */
  pieces?: BoardPiece[];
  /**
   * From what side the user wil be seeing the board from.
   */
  perspective: PieceColor;
  /**
   * Legal moves from the current position.
   */
  legalMoves?: MoveDto[];
  /**
   * Wether the pieces can be moved.
   */
  movablePieces?: boolean;
};

export const Board: React.FC<BoardProps> = ({
  pieces = startingBoard,
  perspective,
  legalMoves = [],
  movablePieces = false,
}) => {
  const [movingPiece, setMovingPiece] = useState<BoardCoordinateDto | null>(
    null,
  );

  const onPieceMoveStart = (coordinate: BoardCoordinateDto) => {
    setMovingPiece(coordinate);
  };

  const onPieceMoveEnd = () => {
    setMovingPiece(null);
  };

  let markedBlocks: number[] | undefined;

  if (movingPiece) {
    const movingPieceLegalMoves = legalMoves.filter((legalMove) =>
      isCoordinateEqual(legalMove.from, movingPiece),
    );
    markedBlocks = movingPieceLegalMoves.map((legalMove) => {
      return coordinateToIndex(legalMove.to);
    });
  }

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
      movablePiece={movablePieces}
      mark={
        markedBlocks &&
        markedBlocks.find((markedIndex) => index === markedIndex) !== undefined
      }
      onPieceMoveStart={onPieceMoveStart}
      onPieceMoveEnd={onPieceMoveEnd}
    />
  ));

  if (perspective === PieceColor.WHITE) {
    boardTiles.reverse();
  }
  return <div className="chess-board">{boardTiles}</div>;
};
