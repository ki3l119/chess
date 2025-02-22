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

  /**
   * Called when the user releases their primary pointer button within the tile.
   */
  onPointerRelease?: (coordinate: BoardCoordinateDto) => void;

  rankLabel?: string;

  fileLabel?: string;
};

const BoardTile: React.FC<BoardTileProps> = ({
  index,
  piece,
  movablePiece,
  mark = false,
  onPieceMoveStart,
  onPieceMoveEnd,
  onPointerRelease,
  rankLabel,
  fileLabel,
}) => {
  const coordinate = indexToCoordinate(index);

  // For tracking mouse position during piece movement
  const mouseClientRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const startMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element) {
      event.target.releasePointerCapture(event.pointerId);
    }

    const pieceElement = event.currentTarget;
    if (pieceElement === null) {
      return;
    }

    const draggingClass = "chess-board__tile-piece--moving";
    mouseClientRef.current.x = event.clientX;
    mouseClientRef.current.y = event.clientY;

    if (event.button !== 0) {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      const clientXDiff = event.clientX - mouseClientRef.current.x;
      const clientYDiff = event.clientY - mouseClientRef.current.y;

      mouseClientRef.current.x = event.clientX;
      mouseClientRef.current.y = event.clientY;

      const pieceBoundingRect = pieceElement.getBoundingClientRect();
      pieceElement.style.top =
        (pieceBoundingRect.y + clientYDiff).toString() + "px";
      pieceElement.style.left =
        (pieceBoundingRect.x + clientXDiff).toString() + "px";
    };

    const endMove = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      pieceElement.classList.remove(draggingClass);
      pieceElement.style.removeProperty("top");
      pieceElement.style.removeProperty("left");
      pieceElement.style.removeProperty("height");
      pieceElement.style.removeProperty("width");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endMove);
      if (onPieceMoveEnd) {
        onPieceMoveEnd();
      }
    };

    mouseClientRef.current.x = event.clientX;
    mouseClientRef.current.y = event.clientY;

    const boundingRect = pieceElement.getBoundingClientRect();
    pieceElement.style.height = boundingRect.height.toString() + "px";
    pieceElement.style.width = boundingRect.width.toString() + "px";

    pieceElement.classList.add(draggingClass);
    document.addEventListener("pointerup", endMove);
    document.addEventListener("pointermove", onPointerMove);

    if (onPieceMoveStart) {
      onPieceMoveStart(coordinate);
    }
  };

  const tilePieceClasses = ["chess-board__tile-piece"];

  if (movablePiece) {
    tilePieceClasses.push("chess-board__tile-piece--movable");
  }

  let tileModifier: string;
  if (coordinate.rank % 2 == 0) {
    tileModifier = index % 2 == 0 ? "light" : "dark";
  } else {
    tileModifier = index % 2 == 0 ? "dark" : "light";
  }

  const onPointerUp =
    onPointerRelease &&
    ((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        onPointerRelease(coordinate);
      }
    });

  return (
    <div
      className={`chess-board__tile chess-board__tile--${tileModifier}`}
      onPointerUp={onPointerUp}
    >
      {rankLabel && (
        <p className={"chess-board__tile-label chess-board__tile-label--rank"}>
          {rankLabel}
        </p>
      )}
      {fileLabel && (
        <p className={"chess-board__tile-label chess-board__tile-label--file"}>
          {fileLabel}
        </p>
      )}
      <div
        className={tilePieceClasses.join(" ")}
        onPointerDown={movablePiece ? startMove : undefined}
      >
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
   * Called when player makes a legal move.
   */
  onLegalMove?: (move: MoveDto) => void;
};

export const Board: React.FC<BoardProps> = ({
  pieces = startingBoard,
  perspective,
  legalMoves = [],
  movablePieces,
  onLegalMove,
}) => {
  const [movingPiece, setMovingPiece] = useState<BoardCoordinateDto>();

  const onPieceMoveStart = (coordinate: BoardCoordinateDto) => {
    setMovingPiece(coordinate);
  };

  const onTilePointerRelease =
    movingPiece &&
    ((coordinate: BoardCoordinateDto) => {
      if (onLegalMove) {
        const isLegalMove =
          legalMoves.find(
            (legalMove) =>
              isCoordinateEqual(legalMove.from, movingPiece) &&
              isCoordinateEqual(legalMove.to, coordinate),
          ) !== undefined;
        if (isLegalMove) {
          onLegalMove({
            from: movingPiece,
            to: coordinate,
          });
        }
      }
    });

  const onPieceMoveEnd = () => {
    setMovingPiece(undefined);
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

  const labelledRank = perspective === PieceColor.WHITE ? 0 : 7;
  const labelledFile = labelledRank;
  const boardTiles = board.map((piece, index) => {
    const coordinate = indexToCoordinate(index);

    let fileLabel: string | undefined;
    let rankLabel: string | undefined;
    if (coordinate.rank === labelledRank) {
      fileLabel = String.fromCharCode(97 + coordinate.file);
    }

    if (coordinate.file === labelledFile) {
      rankLabel = String(coordinate.rank + 1);
    }

    return (
      <BoardTile
        key={`${index}-${piece ? `${piece.color}-${piece.name}` : "null"}`}
        index={index}
        piece={piece}
        movablePiece={piece !== null && piece.color === movablePieces}
        mark={
          markedBlocks &&
          markedBlocks.find((markedIndex) => index === markedIndex) !==
            undefined
        }
        onPieceMoveStart={onPieceMoveStart}
        onPieceMoveEnd={onPieceMoveEnd}
        onPointerRelease={onTilePointerRelease}
        fileLabel={fileLabel}
        rankLabel={rankLabel}
      />
    );
  });

  // Modify board tile order so that it has correct perspective from player.
  const boardTilesCorrected: React.JSX.Element[] = [];
  for (let i = 0; i < 8; i++) {
    const rankPieces = boardTiles.slice(i * 8, (i + 1) * 8).reverse();
    boardTilesCorrected.push(...rankPieces);
  }
  if (perspective === PieceColor.WHITE) {
    boardTilesCorrected.reverse();
  }

  return <div className="chess-board">{boardTilesCorrected}</div>;
};
