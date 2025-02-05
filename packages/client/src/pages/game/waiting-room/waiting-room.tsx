import React, { useEffect, useState } from "react";
import { faCopy, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PlayerDto } from "chess-shared-types";
import "./waiting-room.scss";
import { Button } from "@/components/button/button";

import { Game, JoinEvent } from "../game";

type WaitingRoomPlayerProps = {
  displayName?: string;
  isUser?: boolean;
};

const WaitingRoomPlayer: React.FC<WaitingRoomPlayerProps> = ({
  displayName,
  isUser = false,
}) => {
  return (
    <div className="waiting-room__player">
      {displayName ? (
        <>
          <FontAwesomeIcon icon={faUser} />
          <p>{displayName}</p>
          {isUser && (
            <p className="waiting-room__current-player-indicator">(You)</p>
          )}
        </>
      ) : (
        <p>Waiting for opponent...</p>
      )}
    </div>
  );
};

type WaitingRoomProps = {
  game: Game;
};

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ game }) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [opponent, setOpponent] = useState<PlayerDto | null>(null);

  useEffect(() => {
    const joinEventCallback = (event: JoinEvent) => {
      setOpponent(event.player);
    };
    const player = game.getPlayer();
    if (game.isHost && !player) {
      game.addEventListener("join", joinEventCallback);
    } else if (player) {
      setOpponent(player);
    }

    return () => {
      game.removeEventListener("join", joinEventCallback);
    };
  }, [game]);

  const onCopyClick = () => {
    navigator.clipboard.writeText(game.getId());

    setShowCopiedMessage(true);

    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  return (
    <div className="waiting-room">
      <p className="waiting-room__section-title">Game ID</p>
      <div className="waiting-room__game-id-section">
        <p>{game.getId()}</p>
        {showCopiedMessage ? (
          <p>Copied</p>
        ) : (
          <FontAwesomeIcon
            icon={faCopy}
            className="waiting-room__game-id-section-copy"
            onClick={onCopyClick}
          />
        )}
      </div>
      <p className="waiting-room__section-title">Players</p>
      <div className="waiting-room__players">
        <WaitingRoomPlayer
          displayName={game.getHost().name}
          isUser={game.isHost}
        />
        {opponent && (
          <WaitingRoomPlayer
            displayName={opponent.name}
            isUser={!game.isHost}
          />
        )}
      </div>
      {game.isHost ? (
        <Button disabled={opponent === undefined}>Start Game</Button>
      ) : (
        <p>Waiting for host to start the game...</p>
      )}
    </div>
  );
};
