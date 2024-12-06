import React, { useState } from "react";
import { Board } from "../board/board";
import { BoardPiece, getStartingBoard } from "../../utils/chess";

import "./game.scss";

const startingBoard = getStartingBoard();

export const Game: React.FC = () => {
  const [board, setBoard] = useState<BoardPiece[]>(startingBoard);

  return (
    <div className="game">
      <Board board={board} />
    </div>
  );
};
