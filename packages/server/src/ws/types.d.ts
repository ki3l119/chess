import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export type IncomingMessageWithUser = IncomingMessage & {
  userId?: string;
};

export type WebSocketExtended = WebSocket & {
  id: string;
  userId?: string;
};

export type WebSocketMessage = {
  event: string;
  data: any;
};
