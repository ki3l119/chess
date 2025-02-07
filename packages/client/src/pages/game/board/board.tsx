import React, { useState, useRef, useEffect } from "react";
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
  const pieceRef = useRef<HTMLDivElement>(null);
  let coordinate: BoardCoordinateDto;
  useEffect(() => {
    // For handling piece movement
    let startMove: (event: MouseEvent) => void;
    if (movablePiece && pieceRef.current) {
      const draggingClass = "chess-board__tile-piece--moving";
      const pieceElement = pieceRef.current;

      // For tracking position of mouse during piece movement
      let mouseClientX = 0;
      let mouseClientY = 0;

      startMove = (event) => {
        if (event.button !== 0) {
          return;
        }

        const onMouseMove = (event: MouseEvent) => {
          const clientXDiff = event.clientX - mouseClientX;
          const clientYDiff = event.clientY - mouseClientY;

          mouseClientX = event.clientX;
          mouseClientY = event.clientY;

          const pieceBoundingRect = pieceElement.getBoundingClientRect();
          pieceElement.style.top =
            (pieceBoundingRect.y + clientYDiff).toString() + "px";
          pieceElement.style.left =
            (pieceBoundingRect.x + clientXDiff).toString() + "px";
        };

        const endMove = () => {
          pieceElement.classList.remove(draggingClass);
          pieceElement.style.removeProperty("top");
          pieceElement.style.removeProperty("left");
          pieceElement.style.removeProperty("height");
          pieceElement.style.removeProperty("width");
          document.removeEventListener("mousemove", onMouseMove);

          if (onPieceMoveEnd) {
            onPieceMoveEnd();
          }
        };

        mouseClientX = event.clientX;
        mouseClientY = event.clientY;

        const boundingRect = pieceElement.getBoundingClientRect();
        pieceElement.style.height = boundingRect.height.toString() + "px";
        pieceElement.style.width = boundingRect.width.toString() + "px";

        pieceElement.classList.add(draggingClass);
        document.addEventListener("mouseup", endMove, { once: true });
        document.addEventListener("mousemove", onMouseMove);

        if (onPieceMoveStart) {
          onPieceMoveStart(coordinate);
        }
      };

      pieceElement.addEventListener("mousedown", startMove);
    }

    return () => {
      if (movablePiece && pieceRef.current) {
        pieceRef.current.removeEventListener("mousedown", startMove);
      }
    };
  }, [pieceRef.current]);

  const tilePieceClasses = ["chess-board__tile-piece"];

  if (movablePiece) {
    tilePieceClasses.push("chess-board__tile-piece--movable");
  }
  coordinate = indexToCoordinate(index);
  let tileModifier: string;
  if (coordinate.rank % 2 == 0) {
    tileModifier = index % 2 == 0 ? "light" : "dark";
  } else {
    tileModifier = index % 2 == 0 ? "dark" : "light";
  }

  return (
    <div className={`chess-board__tile chess-board__tile--${tileModifier}`}>
      <div className={tilePieceClasses.join(" ")} ref={pieceRef}>
        {piece && <Piece type={piece} />}
      </div>
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
   * Wether the specified color pieces can be moved.
   */
  movablePieces?: PieceColor;
  /**
   *
   */
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
      movablePiece={piece !== null && piece.color === movablePieces}
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
