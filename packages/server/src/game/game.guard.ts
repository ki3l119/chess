import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

import type { GameSocket } from "./types";
import { MESSAGE_METADATA } from "@nestjs/websockets/constants";
import { Reflector } from "@nestjs/core";
import { WebSocketException } from "../ws";

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

@Injectable()
/**
 * GameGuard that emits ${event}:error when socket is not part of a game.
 */
export class GameGuardWithResponse extends GameGuard {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const event = this.reflector.get(MESSAGE_METADATA, context.getHandler());
    const wsContext = context.switchToWs();
    const socket = wsContext.getClient<GameSocket>();
    if (socket.gameId === undefined) {
      throw new WebSocketException(`${event}:error`, {
        title: "Not part of game.",
        details: "You are not included in an existing chess game.",
      });
    }
    return true;
  }
}
