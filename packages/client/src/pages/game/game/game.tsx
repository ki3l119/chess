import React, { useState } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./game.scss";
import { Game as GameModel } from "../game";
import { Board } from "../board/board";
import { BoardPiece } from "../utils/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type GameProps = {
  game: GameModel;
};

export const Game: React.FC<GameProps> = ({ game }) => {
  const [pieces, setPieces] = useState<BoardPiece[]>(game.getPieces());
  const userPlayer = game.getUserPlayer();
  const opponent = game.getOpponent();

  return (
    <div className="game">
      <div className="game__player">
        <FontAwesomeIcon icon={faUser} />
        <p className="game__player-name">{opponent.name}</p>
      </div>
      <Board pieces={pieces} perspective={userPlayer.color} />
      <div className="game__player">
        <FontAwesomeIcon icon={faUser} />
        <p className="game__player-name">{userPlayer.name}</p>
      </div>
    </div>
  );
};
