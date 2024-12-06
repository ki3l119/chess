import { Injectable } from "@nestjs/common";

import type { WebSocketExtended, WebSocketMessage } from "./types";
import { Room, RoomEmitOptions } from "./room";

@Injectable()
export class RoomService {
  private readonly rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  /**
   * Emits the message to the sockets belonging to the specified room.
   */
  emit(
    roomId: string,
    message: WebSocketMessage,
    options: RoomEmitOptions = {},
  ) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.emit(message, options);
    }
  }

  /**
   * Adds the socket to the room.
   */
  join(roomId: string, socket: WebSocketExtended) {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId);
      this.rooms.set(room.id, room);
    }
    room.addSocket(socket);
  }

  /**
   * Removes the socket from the room.
   */
  leave(roomId: string, socket: WebSocketExtended) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    room.removeSocket(socket);
    if (room.getSocketCount() == 0) {
      this.rooms.delete(room.id);
    }
  }

  /**
   * Returns how many sockets are listening to the specified room. If the room
   * does not exist, returns null.
   */
  getSocketCount(roomId: string): number | null {
    const room = this.rooms.get(roomId);
    return room ? room.getSocketCount() : null;
  }

  getSockets(roomId: string): WebSocketExtended[] | null {
    const room = this.rooms.get(roomId);
    return room ? room.getSockets() : null;
  }
}
