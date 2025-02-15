import React, { useState, useEffect } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./game.scss";
import { Game as GameModel, EndEvent, OpponentMoveEvent } from "../game";
import { Board } from "../board/board";
import {
  BoardPiece,
  getOppositeColor,
  isCoordinateEqual,
  PieceColor,
} from "../utils/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GameResultDto, MoveDto } from "chess-shared-types";
import { GameModal } from "../game-modal/game-modal";
import { Button } from "@/components/button/button";

export type GameProps = {
  game: GameModel;

  /**
   * Executes once the game has finished.
   */
  onEnd?: () => void;
};

export const Game: React.FC<GameProps> = ({ game, onEnd }) => {
  const [pieces, setPieces] = useState<BoardPiece[]>(game.getPieces());
  const [legalMoves, setLegalMoves] = useState<MoveDto[]>(game.getLegalMoves());
  const [activePlayer, setActivePlayer] = useState<PieceColor>(
    PieceColor.WHITE,
  );
  const [isWaitingMoveValidation, setIsWaitingMoveValidation] = useState(false);

  const [gameResult, setGameResult] = useState<GameResultDto | null>(null);

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
      if (event.gameResult) {
        setGameResult(event.gameResult);
      }
    };
    game.addEventListener("opponent-move", opponentMoveEventListener);

    const endEventListener = (event: EndEvent) => {
      setGameResult(event.gameResult);
    };

    game.addEventListener("end", endEventListener);

    return () => {
      game.removeEventListener("opponent-move", opponentMoveEventListener);
      game.removeEventListener("end", endEventListener);
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
          const moveSuccessDto = await game.move(moveDto);
          switchActivePlayer(
            moveSuccessDto.newPosition,
            moveSuccessDto.legalMoves,
          );
          if (moveSuccessDto.gameResult) {
            setGameResult(moveSuccessDto.gameResult);
          }
        } catch (e) {
          setPieces(pieces);
        } finally {
          setIsWaitingMoveValidation(false);
        }
      }
    : undefined;

  const gameResultTitle = gameResult
    ? gameResult.winner === null
      ? "Draw"
      : gameResult.winner === userPlayer.color
        ? "You Won!"
        : `${gameResult.winner === "BLACK" ? "Black" : "White"} Won`
    : undefined;

  const gameResultReasonMapping = {
    CHECKMATE: "by checkmate",
    STALEMATE: "by stalemate",
    FIFTY_MOVE_RULE: "by 50-move rule",
    ABANDONED: "Your opponent left the game",
    TIMEOUT: "by timeout",
  };

  return (
    <div className="game">
      <GameModal isOpen={gameResult != null} title={gameResultTitle}>
        <p>{gameResult && gameResultReasonMapping[gameResult.reason]}</p>
        <Button onClick={onEnd}>Finish</Button>
      </GameModal>
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
          isActivePlayer && !isWaitingMoveValidation && !gameResult
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
