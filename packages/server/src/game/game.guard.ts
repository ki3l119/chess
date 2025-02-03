import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

import type { GameSocket } from "./types";

@Injectable()
/**
 * Ensures that the player associated with the socket is part of a game.
 */
export class GameGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient<GameSocket>();
    return socket.gameId !== undefined;
  }
}
