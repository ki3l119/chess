import { createContext, useContext } from "react";

import { GameManager } from "../models";

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
