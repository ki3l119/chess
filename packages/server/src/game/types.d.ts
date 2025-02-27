import { WebSocketExtended } from "../ws";

export type GameSocket = WebSocketExtended & {
  gameId?: string;
  isAlive: boolean;
};
