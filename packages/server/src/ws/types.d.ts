import { IncomingMessage } from "http";
import { WebSocket } from "ws";

import { UserDto } from "chess-shared-types";

export type IncomingMessageWithUser = IncomingMessage & {
  user?: UserDto;
};

export type WebSocketExtended = WebSocket & {
  id: string;
  user?: UserDto;
};

export type WebSocketMessage = {
  event: string;
  data: any;
};
