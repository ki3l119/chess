import { WebSocketMessage } from "./types";

/**
 * Formats the message into a string to be sent with a WebSocket.
 */
export function formatEvent(message: WebSocketMessage): string {
  return JSON.stringify(message);
}
