import React, { useState } from "react";

import "./game.scss";
import { Game as GameModel } from "../game";
import { Board } from "../board/board";
import { BoardPiece } from "../utils/chess";

export type GameProps = {
  game: GameModel;
};

export const Game: React.FC<GameProps> = ({ game }) => {
  const [pieces, setPieces] = useState<BoardPiece[]>(game.getPieces());
  const userPlayer = game.getUserPlayer();
  return (
    <div className="game">
      <Board pieces={pieces} perspective={userPlayer.color} />
    </div>
  );
};
