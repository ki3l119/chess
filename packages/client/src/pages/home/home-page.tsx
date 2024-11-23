import React from "react";
import "./home-page.scss";

import { getStartingBoard } from "../../utils/chess";
import { Board } from "../../components/board/board";

const startingBoard = getStartingBoard();

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="home-page__main-section">
        <div className="home-page__board">
          <Board board={startingBoard} />
        </div>
      </div>
    </div>
  );
};
