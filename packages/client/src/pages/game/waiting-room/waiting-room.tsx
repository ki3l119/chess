import React, { useContext, useEffect, useState } from "react";
import { faCopy, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { NewPlayerDto } from "chess-shared-types";
import "./waiting-room.scss";
import { Button } from "@/components/button/button";
import { UserContext } from "@/contexts";
import { useGame } from "../game.context";
import { JoinEvent } from "../../../services/game-manager";

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
  gameId: string;
  opponent?: string;
  isHost: boolean;
  onJoin?: (newPlayer: NewPlayerDto) => void;
};

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameId,
  isHost,
  opponent,
  onJoin,
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const { gameManager } = useGame();
  const { user } = useContext(UserContext);
  const displayName = user?.username || "Guest";

  const onCopyClick = () => {
    navigator.clipboard.writeText(gameId);

    setShowCopiedMessage(true);

    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  useEffect(() => {
    const joinEventCallback = (event: JoinEvent) => {
      if (onJoin) {
        onJoin(event.newPlayer);
      }
    };
    gameManager.addEventListener("join", joinEventCallback);

    return () => {
      gameManager.removeEventListener("join", joinEventCallback);
    };
  }, [gameManager]);

  const host = isHost ? displayName : opponent;
  const otherPlayer = isHost ? opponent : displayName;
  return (
    <div className="waiting-room">
      <p className="waiting-room__section-title">Game ID</p>
      <div className="waiting-room__game-id-section">
        <p>{gameId}</p>
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
        <WaitingRoomPlayer displayName={host} isUser={isHost} />
        <WaitingRoomPlayer displayName={otherPlayer} isUser={!isHost} />
      </div>
      {isHost ? (
        <Button disabled={opponent === undefined}>Start Game</Button>
      ) : (
        <p>Waiting for host to start the game...</p>
      )}
    </div>
  );
};
