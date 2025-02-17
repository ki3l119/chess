import React, { useEffect, useState } from "react";
import { faCopy, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./waiting-room.scss";
import { Button } from "@/components/button/button";

import { GameInfo, Player } from "../utils/chess";
import { GameSocket, JoinEvent } from "../game-socket";

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
  gameSocket: GameSocket;

  gameInfo: GameInfo;

  onJoin?: (player: Player) => void;

  onLeave?: () => void;

  /**
   * Called when the waiting room has ended.
   */
  onEnd?: () => void;
};

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameSocket,
  gameInfo,
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const onCopyClick = () => {
    navigator.clipboard.writeText(gameInfo.id);

    setShowCopiedMessage(true);

    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  const startGame = () => {
    gameSocket.startGame();
    setIsStarting(true);
  };

  return (
    <div className="waiting-room">
      <p className="waiting-room__section-title">Game ID</p>
      <div className="waiting-room__game-id-section">
        <p>{gameInfo.id}</p>
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
          displayName={gameInfo.host.name}
          isUser={gameInfo.isHost}
        />
        {gameInfo.player && (
          <WaitingRoomPlayer
            displayName={gameInfo.player.name}
            isUser={!gameInfo.isHost}
          />
        )}
      </div>
      {gameInfo.isHost ? (
        <Button
          disabled={gameInfo.player == undefined || isStarting}
          onClick={startGame}
        >
          Start Game
        </Button>
      ) : (
        <p>Waiting for host to start the game...</p>
      )}
    </div>
  );
};
