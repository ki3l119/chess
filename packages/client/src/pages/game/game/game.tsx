import React, { useState, useEffect, useRef } from "react";
import { faCircleXmark, faUser } from "@fortawesome/free-solid-svg-icons";

import "./game.scss";
import {
  GameSocket,
  EndEvent,
  OpponentMoveEvent,
  SuccessfulMoveEvent,
} from "../game-socket";
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
  PieceName,
  PromotionPieceName,
} from "../utils/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GameModal } from "../game-modal/game-modal";
import { Button } from "@/components/button/button";
import { EventMessageWebSocketException } from "@/ws";
import { PromotionPieceSelector } from "../promotion-piece-selector/promotion-piece-selector";

/**
 * Formats time to "MM:SS"
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  const minuteStr =
    minutes < 10 ? `0${minutes.toString()}` : minutes.toString();
  const secondStr =
    remainingSeconds < 10
      ? `0${remainingSeconds.toString()}`
      : remainingSeconds.toString();
  return `${minuteStr}:${secondStr}`;
}

type PlayerSectionProps = {
  player: Player;
  isActive: boolean;
  timerDuration: number;
  gameSocket: GameSocket;
  isCurrentUser: boolean;
  isTimedOut?: boolean;
};

export const PlayerSection: React.FC<PlayerSectionProps> = ({
  player,
  isActive,
  timerDuration,
  gameSocket,
  isCurrentUser,
  isTimedOut = false,
}) => {
  const [remainingTime, setRemainingTime] = useState(timerDuration);
  const intervalIdRef = useRef<number | null>(null);

  const startTimer = () => {
    intervalIdRef.current = setInterval(() => {
      setRemainingTime((remainingTime) => remainingTime - 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive) {
      if (intervalIdRef.current === null) {
        startTimer();
      } else if (remainingTime <= 0) {
        stopTimer();
      }
    } else if (intervalIdRef.current) {
      stopTimer();
    }
  }, [isActive, remainingTime]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  useEffect(() => {
    const moveListener = (event: SuccessfulMoveEvent | OpponentMoveEvent) => {
      setRemainingTime(event.remainingTime);
    };

    const moveEventName = isCurrentUser ? "successful-move" : "opponent-move";

    gameSocket.addEventListener(moveEventName, moveListener);

    return () => {
      gameSocket.removeEventListener(moveEventName, moveListener);
    };
  }, [gameSocket, isCurrentUser]);

  return (
    <div className="game__player">
      <div className="game__player-info">
        <FontAwesomeIcon icon={faUser} />
        <p className="game__player-name">{player.name}</p>
      </div>
      <div
        className={
          "game__player-timer" + (isActive ? " game__player-timer--active" : "")
        }
      >
        {isTimedOut ? formatTime(0) : formatTime(remainingTime)}
      </div>
    </div>
  );
};

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
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>(initialLegalMoves);
  const [activePlayer, setActivePlayer] = useState<PieceColor>(
    PieceColor.WHITE,
  );
  const [isWaitingMoveValidation, setIsWaitingMoveValidation] = useState(false);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [pawnPromotionInput, setPawnPromotionInput] = useState<{
    previousPosition: BoardPiece[];
    move: Move;
  } | null>(null);

  const switchActivePlayer = (
    newMove: Move,
    newPosition: BoardPiece[],
    legalMoves: Move[],
  ) => {
    setLastMove(newMove);
    setPieces(newPosition);
    setLegalMoves(legalMoves);
    setActivePlayer(getOppositeColor(activePlayer));
  };

  useEffect(() => {
    const opponentMoveEventListener = (event: OpponentMoveEvent) => {
      switchActivePlayer(event.move, event.newPosition, event.legalMoves);
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

  const onPawnPromotionPick = async (pieceChoice: PromotionPieceName) => {
    if (!pawnPromotionInput) {
      return;
    }
    try {
      setIsWaitingMoveValidation(true);
      setPawnPromotionInput(null);
      const moveResult = await gameSocket.move(pawnPromotionInput.move, {
        pawnPromotionPiece: pieceChoice,
      });
      switchActivePlayer(
        pawnPromotionInput.move,
        moveResult.newPosition,
        moveResult.legalMoves,
      );
      if (moveResult.gameResult) {
        setGameResult(moveResult.gameResult);
      }
    } catch (e) {
      setPieces(pawnPromotionInput.previousPosition);
    } finally {
      setIsWaitingMoveValidation(false);
    }
  };

  const onPawnPromotionClose = () => {
    if (pawnPromotionInput) {
      setPawnPromotionInput(null);
      setPieces(pawnPromotionInput.previousPosition);
    }
  };

  const onLegalMove = async (move: Move) => {
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

      // For pawn promotion
      const opponentBackrank = userPlayer.color === PieceColor.WHITE ? 7 : 0;
      if (
        movingPiece.type.name === PieceName.PAWN &&
        move.to.rank === opponentBackrank
      ) {
        setPawnPromotionInput({
          previousPosition: pieces,
          move,
        });
        return;
      }

      const moveResult = await gameSocket.move(move);
      switchActivePlayer(move, moveResult.newPosition, moveResult.legalMoves);
      if (moveResult.gameResult) {
        setGameResult(moveResult.gameResult);
      }
    } catch (e) {
      setPieces(pieces);
    } finally {
      setIsWaitingMoveValidation(false);
    }
  };

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
      <GameModal
        isOpen={pawnPromotionInput != null}
        title="Pawn Promotion"
        icon={{
          iconDefinition: faCircleXmark,
          position: "right",
          onClick: onPawnPromotionClose,
        }}
      >
        <PromotionPieceSelector
          pieceColor={userPlayer.color}
          onSelect={onPawnPromotionPick}
        />
      </GameModal>
      <PlayerSection
        player={opponent}
        isActive={!gameResult && !isActivePlayer}
        timerDuration={gameInfo.playerTimerDuration}
        gameSocket={gameSocket}
        isCurrentUser={false}
        isTimedOut={
          gameResult != null &&
          gameResult.reason === "TIMEOUT" &&
          gameResult.winner !== opponent.color
        }
      />

      <div className="game__board">
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
          highlightedTiles={lastMove ? [lastMove.from, lastMove.to] : undefined}
        />
      </div>
      <PlayerSection
        player={userPlayer}
        isActive={!gameResult && isActivePlayer}
        timerDuration={gameInfo.playerTimerDuration}
        gameSocket={gameSocket}
        isCurrentUser={true}
        isTimedOut={
          gameResult != null &&
          gameResult.reason === "TIMEOUT" &&
          gameResult.winner !== userPlayer.color
        }
      />
    </div>
  );
};
