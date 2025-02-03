import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GameSocket } from "./types";

/**
 * Provides the game id the client is currently part in.
 */
export const CurrentGame = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const socket = context.switchToWs().getClient<GameSocket>();
    if (!socket.gameId) {
      throw new Error("Socket is not associated with any game.");
    }
    return socket.gameId;
  },
);
