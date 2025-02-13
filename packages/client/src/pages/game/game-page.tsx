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
import { GameManager } from "./game-manager";
import { Game as GameComponent } from "./game/game";
import { Game } from "./game";
import { GameModal } from "./game-modal/game-modal";
import { Board } from "./board/board";
import { PieceColor } from "./utils/chess";

enum GameInitModal {
  NONE,
  CREATE,
  JOIN,
  WAITING_ROOM,
}

export const GamePage: React.FC = () => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gameInitModal, setGameInitModal] = useState<GameInitModal>(
    GameInitModal.NONE,
  );
  const [hasGameStarted, setHasGameStarted] = useState(false);

  useEffect(() => {
    const initGameManager = async () => {
      try {
        const webSocketUrl = new URL("/games", config.serverBaseUrl);
        const manager = await GameManager.fromWebSocketUrl(webSocketUrl.href);
        setGameManager(manager);
        return manager;
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

    const gameManagerPromise = initGameManager();

    return () => {
      gameManagerPromise.then((gameManager) => {
        gameManager?.close();
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (game) {
        game.close();
      }
    };
  }, [game]);

  const onNewGame = (game: Game) => {
    game.addEventListener("start", () => {
      setHasGameStarted(true);
    });
    setGame(game);
  };

  const onWaitingRoomEnd = () => {
    setGame(null);
  };

  const onGameEnd = () => {
    setGame(null);
    setHasGameStarted(false);
  };

  const onWaitingRoomExit = () => {
    const confirmExit = confirm("Are you sure you want to exit the game.");
    if (game && confirmExit) {
      game.leave();
      setGame(null);
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
        gameManager &&
        (!game ? (
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
              <CreateGameForm onCreate={onNewGame} gameManager={gameManager} />
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
              <JoinGameForm onJoin={onNewGame} gameManager={gameManager} />
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
              <WaitingRoom game={game} onEnd={onWaitingRoomEnd} />
            </GameModal>
          )
        ))
      )}
      <div
        className={
          "game-page__game" +
          (!game || !hasGameStarted ? " game-page__game--blur" : "")
        }
      >
        {game && hasGameStarted ? (
          <GameComponent game={game} onEnd={onGameEnd} />
        ) : (
          <Board perspective={PieceColor.WHITE} />
        )}
      </div>
    </div>
  );
};
