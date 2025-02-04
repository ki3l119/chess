import React, { useState } from "react";

import "./game.scss";
import { BoardPiece, getStartingBoard } from "@/utils/chess";
import { Board } from "../board/board";

const startingBoard = getStartingBoard();

export const Game: React.FC = () => {
  const [board, setBoard] = useState<BoardPiece[]>(startingBoard);

  return (
    <div className="game">
      <Board board={board} />
    </div>
  );
};
