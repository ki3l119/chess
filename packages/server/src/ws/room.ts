import type { WebSocketExtended, WebSocketMessage } from "./types";
import { formatEvent } from "./ws.utils";

export type RoomEmitOptions = {
  /**
   * Id of sockets that should not send the message.
   */
  exclude?: string[];
};

/**
 * Contains a collection of sockets that would send messages
 * emitted to the room.
 */
export class Room<T extends WebSocketExtended = WebSocketExtended> {
  private readonly sockets: Map<string, T>;

  constructor(public readonly id: string) {
    this.sockets = new Map();
  }

  addSocket(socket: T) {
    this.sockets.set(socket.id, socket);
  }

  getSocketCount() {
    return this.sockets.size;
  }

  removeSocket(socket: T) {
    this.sockets.delete(socket.id);
  }

  /**
   * Emits the specified message to all sockets that are currently in the room.
   */
  emit(message: WebSocketMessage, options: RoomEmitOptions = {}) {
    for (const [id, socket] of this.sockets) {
      if (options.exclude?.includes(socket.id)) {
        continue;
      }
      socket.send(formatEvent(message));
    }
  }

  getSockets() {
    return Array.from(this.sockets.values());
  }
}
