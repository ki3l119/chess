import React, { useState, useEffect } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./game.scss";
import { GameSocket, EndEvent, OpponentMoveEvent } from "../game-socket";
import { Board } from "../board/board";
import {
  BoardPiece,
  getOppositeColor,
  isCoordinateEqual,
  PieceColor,
  Move,
  GameResult,
  GameInfo,
  Player,
} from "../utils/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GameModal } from "../game-modal/game-modal";
import { Button } from "@/components/button/button";

export type GameProps = {
  gameSocket: GameSocket;
  startingBoard: BoardPiece[];
  initialLegalMoves: Move[];
  gameInfo: Required<GameInfo>;
  /**
   * Executes once the game has finished.
   */
  onEnd?: () => void;
};

export const Game: React.FC<GameProps> = ({
  startingBoard,
  initialLegalMoves,
  gameSocket,
  onEnd,
  gameInfo,
}) => {
  const [pieces, setPieces] = useState<BoardPiece[]>(startingBoard);
  const [legalMoves, setLegalMoves] = useState<Move[]>(initialLegalMoves);
  const [activePlayer, setActivePlayer] = useState<PieceColor>(
    PieceColor.WHITE,
  );
  const [isWaitingMoveValidation, setIsWaitingMoveValidation] = useState(false);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const switchActivePlayer = (
    newPosition: BoardPiece[],
    legalMoves: Move[],
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
    gameSocket.addEventListener("opponent-move", opponentMoveEventListener);

    const endEventListener = (event: EndEvent) => {
      setGameResult(event.gameResult);
    };

    gameSocket.addEventListener("end", endEventListener);

    return () => {
      gameSocket.removeEventListener(
        "opponent-move",
        opponentMoveEventListener,
      );
      gameSocket.removeEventListener("end", endEventListener);
    };
  }, [gameSocket, activePlayer]);

  let userPlayer: Player;
  let opponent: Player;

  if (gameInfo.isHost) {
    userPlayer = gameInfo.host;
    opponent = gameInfo.player;
  } else {
    userPlayer = gameInfo.player;
    opponent = gameInfo.host;
  }

  const isActivePlayer = activePlayer === userPlayer.color;

  const onLegalMove = isActivePlayer
    ? async (move: Move) => {
        try {
          setIsWaitingMoveValidation(true);
          const newPieces = [...pieces];
          const destinationPieceIndex = newPieces.findIndex((piece) =>
            isCoordinateEqual(piece.coordinate, move.to),
          );
          if (destinationPieceIndex > -1) {
            newPieces.splice(destinationPieceIndex, 1);
          }
          const originPieceIndex = newPieces.findIndex((piece) =>
            isCoordinateEqual(piece.coordinate, move.from),
          );
          const movingPiece = newPieces[originPieceIndex];
          newPieces.splice(originPieceIndex, 1, {
            type: movingPiece.type,
            coordinate: {
              rank: move.to.rank,
              file: move.to.file,
            },
          });
          setPieces(newPieces);
          const moveResult = await gameSocket.move(move);
          switchActivePlayer(moveResult.newPosition, moveResult.legalMoves);
          if (moveResult.gameResult) {
            setGameResult(moveResult.gameResult);
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
