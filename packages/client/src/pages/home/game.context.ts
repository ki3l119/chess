import { createContext, useContext } from "react";

import { GameManager } from "../../services/game-manager";

export const GameContext = createContext<{
  gameManager: GameManager;
  game?: {
    id: string;
  };
} | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error("Game context not defined.");
  }
  return context;
};
