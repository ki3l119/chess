import React, { useState, useEffect } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./game.scss";
import { Game as GameModel, OpponentMoveEvent } from "../game";
import { Board } from "../board/board";
import {
  BoardPiece,
  getOppositeColor,
  isCoordinateEqual,
  PieceColor,
} from "../utils/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MoveDto } from "chess-shared-types";

export type GameProps = {
  game: GameModel;
};

export const Game: React.FC<GameProps> = ({ game }) => {
  const [pieces, setPieces] = useState<BoardPiece[]>(game.getPieces());
  const [legalMoves, setLegalMoves] = useState<MoveDto[]>(game.getLegalMoves());
  const [activePlayer, setActivePlayer] = useState<PieceColor>(
    PieceColor.WHITE,
  );
  const [isWaitingMoveValidation, setIsWaitingMoveValidation] = useState(false);

  const switchActivePlayer = (
    newPosition: BoardPiece[],
    legalMoves: MoveDto[],
  ) => {
    setPieces(newPosition);
    setLegalMoves(legalMoves);
    setActivePlayer(getOppositeColor(activePlayer));
  };

  useEffect(() => {
    const opponentMoveEventListener = (event: OpponentMoveEvent) => {
      switchActivePlayer(event.newPosition, event.legalMoves);
    };
    game.addEventListener("opponent-move", opponentMoveEventListener);

    return () => {
      game.removeEventListener("opponent-move", opponentMoveEventListener);
    };
  }, [game, activePlayer]);

  const userPlayer = game.getUserPlayer();
  const isActivePlayer = activePlayer === userPlayer.color;
  const opponent = game.getOpponent();

  const onLegalMove = isActivePlayer
    ? async (moveDto: MoveDto) => {
        try {
          setIsWaitingMoveValidation(true);
          const newPieces = [...pieces];
          const destinationPieceIndex = newPieces.findIndex((piece) =>
            isCoordinateEqual(piece.coordinate, moveDto.to),
          );
          if (destinationPieceIndex > -1) {
            newPieces.splice(destinationPieceIndex, 1);
          }
          const originPieceIndex = newPieces.findIndex((piece) =>
            isCoordinateEqual(piece.coordinate, moveDto.from),
          );
          const movingPiece = newPieces[originPieceIndex];
          newPieces.splice(originPieceIndex, 1, {
            type: movingPiece.type,
            coordinate: {
              rank: moveDto.to.rank,
              file: moveDto.to.file,
            },
          });
          setPieces(newPieces);
          const result = await game.move(moveDto);
          switchActivePlayer(result.newPosition, result.legalMoves);
        } catch (e) {
          setPieces(pieces);
        } finally {
          setIsWaitingMoveValidation(false);
        }
      }
    : undefined;

  return (
    <div className="game">
      <div className="game__player">
        <FontAwesomeIcon icon={faUser} />
        <p className="game__player-name">
          {opponent.name} {!isActivePlayer && "(Active)"}
        </p>
      </div>
      <Board
        pieces={pieces}
        perspective={userPlayer.color}
        legalMoves={legalMoves}
        movablePieces={
          isActivePlayer && !isWaitingMoveValidation
            ? userPlayer.color
            : undefined
        }
        onLegalMove={onLegalMove}
      />
      <div className="game__player">
        <FontAwesomeIcon icon={faUser} />
        <p className="game__player-name">
          {userPlayer.name} {isActivePlayer && "(Active)"}
        </p>
      </div>
    </div>
  );
};
