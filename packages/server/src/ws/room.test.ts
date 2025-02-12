import { WebSocket } from "ws";
import { describe, it, expect, jest } from "@jest/globals";
import { Room } from "./room";
import { WebSocketExtended, WebSocketMessage } from "./types";

describe("Room", () => {
  it("Add new sockets to the room", () => {
    const room = new Room("0");
    room.addSocket({
      id: "1",
    } as WebSocketExtended);
    expect(room.getSocketCount()).toBe(1);
  });

  it("Removes the specified socket if it exists", () => {
    const room = new Room("0");
    const input = {
      id: "1",
    } as WebSocketExtended;
    room.addSocket(input);
    room.removeSocket(input);
    expect(room.getSocketCount()).toBe(0);
  });

  it("Removes no socket if none is found", () => {
    const room = new Room("0");
    room.addSocket({
      id: "1",
    } as WebSocketExtended);
    room.removeSocket({
      id: "2",
    } as WebSocketExtended);
    expect(room.getSocketCount()).toBe(1);
  });

  it("Sends messages to all sockets on emit", () => {
    const message: WebSocketMessage = {
      event: "test",
      data: {
        test: "data",
      },
    };

    const socketMocks = Array(3)
      .fill(null)
      .map((_, index) => ({
        id: index.toString(),
        send: jest.fn<typeof WebSocket.prototype.send>(),
      }));

    const room = new Room("0");
    for (const socket of socketMocks) {
      room.addSocket(socket as unknown as WebSocketExtended);
    }

    room.emit(message);

    for (const socket of socketMocks) {
      expect(socket.send.mock.calls[0][0]).toBe(JSON.stringify(message));
    }
  });

  it("Sends messages to all sockets on emit except for excluded sockets", () => {
    const message: WebSocketMessage = {
      event: "test",
      data: {
        test: "data",
      },
    };

    const socketMocks = Array(5)
      .fill(null)
      .map((_, index) => ({
        id: index.toString(),
        send: jest.fn<typeof WebSocket.prototype.send>(),
      }));

    const room = new Room("0");
    for (const socket of socketMocks) {
      room.addSocket(socket as unknown as WebSocketExtended);
    }

    room.emit(message, {
      exclude: ["2"],
    });

    for (const socket of socketMocks) {
      if (socket.id === "2") {
        expect(socket.send.mock.calls.length).toBe(0);
      } else {
        expect(socket.send.mock.calls[0][0]).toBe(JSON.stringify(message));
      }
    }
  });
});
