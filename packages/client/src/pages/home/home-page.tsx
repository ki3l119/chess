import React, { useState, useEffect } from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./home-page.scss";

import { CreateGameForm } from "../../components/create-game-form/create-game-form";
import { Button } from "../../components/button/button";
import { Card } from "../../components/card/card";
import { Game } from "../../components/game/game";
import { Spinner } from "../../components/spinner/spinner";
import { GameManager } from "../../models";
import { gameService } from "../../services";
import { GameManagerContext } from "../../contexts";
import { ServiceException } from "../../models";
import { Alert } from "../../components/alert/alert";
import { WaitingRoom } from "../../components/waiting-room/waiting-room";
import { CreateGameSuccessDto, NewPlayerDto } from "chess-shared-types";

enum GameInitStage {
  INIT_OPTIONS,
  CREATE_GAME,
  WAITING_ROOM,
}

type GameInitCardProps = {
  /**
   * Executed when the back icon is pressed
   */
  onBack?: () => void;
  title: string;
  children?: React.ReactNode;
};

const GameInitWindow: React.FC<GameInitCardProps> = ({
  onBack,
  title,
  children,
}) => {
  return (
    <Card title={title}>
      {onBack && (
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="home-page__game-init-back"
          onClick={onBack}
        />
      )}

      {children}
    </Card>
  );
};

export const HomePage: React.FC = () => {
  const [initStage, setInitStage] = useState<GameInitStage | null>(
    GameInitStage.INIT_OPTIONS,
  );
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [opponent, setOpponent] = useState<string | null>(null);

  useEffect(() => {
    const initGameManager = async () => {
      try {
        const manager = await gameService.createGameManager();
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

  const onGameCreate = (createGameSuccessDto: CreateGameSuccessDto) => {
    setGameId(createGameSuccessDto.gameId);
    setInitStage(GameInitStage.WAITING_ROOM);
    setIsHost(true);
  };

  const onPlayerJoin = (newPlayerDto: NewPlayerDto) => {
    setOpponent(newPlayerDto.player);
  };

  let gameInitNode: React.ReactNode | undefined;

  if (gameManager && !errorMessage) {
    switch (initStage) {
      case GameInitStage.INIT_OPTIONS:
        gameInitNode = (
          <div className="home-page__init-options">
            <Button onClick={() => setInitStage(GameInitStage.CREATE_GAME)}>
              Create New Game
            </Button>
          </div>
        );
        break;
      case GameInitStage.CREATE_GAME:
        gameInitNode = (
          <GameInitWindow
            title="Create New Game"
            onBack={() => setInitStage(GameInitStage.INIT_OPTIONS)}
          >
            <CreateGameForm onCreate={onGameCreate} />
          </GameInitWindow>
        );
        break;
      case GameInitStage.WAITING_ROOM:
        if (gameId) {
          gameInitNode = (
            <GameInitWindow title="Game">
              <WaitingRoom
                gameId={gameId}
                opponent={opponent || undefined}
                isHost={isHost}
                onJoin={onPlayerJoin}
              />
            </GameInitWindow>
          );
          break;
        }
    }
  } else if (isConnecting) {
    gameInitNode = <Spinner />;
  } else if (errorMessage) {
    gameInitNode = <Alert type="error" message={errorMessage} />;
  }

  const homePageOptions = ["home-page__game"];

  if (initStage !== null) {
    homePageOptions.push("home-page__game--blur");
  }

  const gameContext = gameManager
    ? {
        gameManager,
      }
    : null;

  return (
    <GameManagerContext.Provider value={gameContext}>
      <div className="home-page">
        {gameInitNode && (
          <div className="home-page__game-init">{gameInitNode}</div>
        )}
        <div className={homePageOptions.join(" ")}>
          <Game />
        </div>
      </div>
    </GameManagerContext.Provider>
  );
};
