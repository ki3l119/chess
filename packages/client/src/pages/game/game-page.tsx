import React, { useState, useEffect } from "react";
import { faArrowLeft, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import "./game-page.scss";
import { CreateGameForm } from "./create-game-form/create-game-form";
import { Button } from "@/components/button/button";
import { Spinner } from "@/components/spinner/spinner";
import { ServiceException } from "@/services";
import { Alert } from "@/components/alert/alert";
import { config } from "@/config";
import { JoinGameForm } from "./join-game-form/join-game-form";
import { WaitingRoom } from "./waiting-room/waiting-room";
import { Game } from "./game/game";
import {
  DisconnectEvent,
  GameSocket,
  JoinEvent,
  StartEvent,
} from "./game-socket";
import { GameModal } from "./game-modal/game-modal";
import { Board } from "./board/board";
import { BoardPiece, GameInfo, Move, PieceColor, Player } from "./utils/chess";

enum GameInitModal {
  NONE,
  CREATE,
  JOIN,
  WAITING_ROOM,
}

export const GamePage: React.FC = () => {
  const [gameSocket, setGameSocket] = useState<GameSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [gameInitModal, setGameInitModal] = useState<GameInitModal>(
    GameInitModal.NONE,
  );
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [initialGameState, setInitialGameState] = useState<{
    board: BoardPiece[];
    legalMoves: Move[];
  } | null>(null);

  useEffect(() => {
    const initGameSocket = async () => {
      try {
        const webSocketUrl = new URL("/games", config.serverBaseUrl);
        const gameSocket = await GameSocket.fromWebSocketUrl(webSocketUrl.href);
        setGameSocket(gameSocket);
        return gameSocket;
      } catch (e) {
        if (e instanceof ServiceException) {
          setErrorMessage(e.details.details);
        } else {
          setErrorMessage("Unknown error occured. Please try again later.");
        }
      } finally {
        setIsConnecting(false);
      }
    };

    const gameSocketInitPromise = initGameSocket();

    return () => {
      gameSocketInitPromise.then((gameSocket) => {
        if (gameSocket) {
          gameSocket.close();
        }
      });
    };
  }, []);

  useEffect(() => {
    const onJoin = (event: JoinEvent) => {
      if (gameInfo) {
        setGameInfo({
          ...gameInfo,
          player: event.player,
        });
      }
    };

    const onStart = (event: StartEvent) => {
      setHasGameStarted(true);
      setInitialGameState({
        board: event.startingPieces,
        legalMoves: event.legalMoves,
      });
    };

    const onWaitingRoomEnd = () => {
      setGameInfo(null);
    };

    const onWaitingRoomLeave = () => {
      if (gameInfo) {
        setGameInfo({
          ...gameInfo,
          player: undefined,
        });
      }
    };

    const onDisconnect = (event: DisconnectEvent) => {
      if (
        event.cause === DisconnectEvent.SERVER_CLOSE ||
        event.cause === DisconnectEvent.HEARTBEAT_TIMEOUT
      ) {
        const message =
          event.cause === DisconnectEvent.HEARTBEAT_TIMEOUT
            ? "Cannot reach the server at the moment. Please try again later."
            : "An unexpected server error has occured. Please try again later.";

        if (gameInfo) {
          alert(message);
        }

        setErrorMessage(message);
      }
      setGameSocket(null);
    };

    if (gameSocket) {
      gameSocket.addEventListener("join", onJoin);
      gameSocket.addEventListener("start", onStart);
      gameSocket.addEventListener("waiting-room-end", onWaitingRoomEnd);
      gameSocket.addEventListener("waiting-room-leave", onWaitingRoomLeave);
      gameSocket.addEventListener("disconnect", onDisconnect);
    }

    return () => {
      if (gameSocket) {
        gameSocket.removeEventListener("join", onJoin);
        gameSocket.removeEventListener("start", onStart);
        gameSocket.removeEventListener("waiting-room-end", onWaitingRoomEnd);
        gameSocket.removeEventListener(
          "waiting-room-leave",
          onWaitingRoomLeave,
        );
        gameSocket.removeEventListener("disconnect", onDisconnect);
      }
    };
  }, [gameSocket, gameInfo]);

  const onNewGame = (gameInfo: GameInfo) => {
    setGameInfo(gameInfo);
  };

  const onGameEnd = () => {
    setGameInfo(null);
    setHasGameStarted(false);
  };

  const onWaitingRoomExit = () => {
    const confirmExit = confirm("Are you sure you want to exit the game?");
    if (gameSocket && confirmExit) {
      gameSocket.leaveGame();
      setGameInfo(null);
    }
  };

  const closeInitModal = () => {
    setGameInitModal(GameInitModal.NONE);
  };

  return (
    <div className="game-page">
      {isConnecting ? (
        <div className="game-page__spinner">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <div className="game-page__error">
          <Alert type="error" message={errorMessage} />
        </div>
      ) : (
        gameSocket &&
        (!gameInfo ? (
          <>
            <GameModal
              isOpen={gameInitModal === GameInitModal.CREATE}
              title="Create Game"
              icon={{
                iconDefinition: faArrowLeft,
                position: "left",
                onClick: closeInitModal,
              }}
            >
              <CreateGameForm onCreate={onNewGame} gameSocket={gameSocket} />
            </GameModal>
            <GameModal
              isOpen={gameInitModal === GameInitModal.JOIN}
              title="Join Game"
              icon={{
                iconDefinition: faArrowLeft,
                position: "left",
                onClick: closeInitModal,
              }}
            >
              <JoinGameForm onJoin={onNewGame} gameSocket={gameSocket} />
            </GameModal>
            {gameInitModal === GameInitModal.NONE && (
              <div className="game-page__init-options">
                <Button onClick={() => setGameInitModal(GameInitModal.CREATE)}>
                  Create New Game
                </Button>
                <Button onClick={() => setGameInitModal(GameInitModal.JOIN)}>
                  Join Game
                </Button>
              </div>
            )}
          </>
        ) : (
          !hasGameStarted && (
            <GameModal
              isOpen={true}
              title="Waiting Room"
              icon={{
                iconDefinition: faCircleXmark,
                position: "right",
                onClick: onWaitingRoomExit,
              }}
            >
              <WaitingRoom gameInfo={gameInfo} gameSocket={gameSocket} />
            </GameModal>
          )
        ))
      )}
      <div
        className={
          "game-page__game" +
          (!gameSocket || !hasGameStarted ? " game-page__game--blur" : "")
        }
      >
        {gameSocket &&
        gameInfo &&
        gameInfo.player &&
        hasGameStarted &&
        initialGameState ? (
          <Game
            gameSocket={gameSocket}
            gameInfo={gameInfo as Required<GameInfo>}
            onEnd={onGameEnd}
            startingBoard={initialGameState.board}
            initialLegalMoves={initialGameState.legalMoves}
          />
        ) : (
          <Board perspective={PieceColor.WHITE} />
        )}
      </div>
    </div>
  );
};
