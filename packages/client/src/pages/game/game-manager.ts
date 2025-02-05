import { TypedEventTarget } from "typescript-event-target";

import { CreateGameDto, GameInfoDto, JoinGameDto } from "chess-shared-types";
import { ServiceException } from "@/services";
import { EventMessageWebSocket } from "@/ws/event-message-ws";
import { Game } from "./game";

/**
 * For creating new games or joining existing games
 */
export class GameManager {
  constructor(private readonly socket: EventMessageWebSocket) {}

  /**
   * Creates a game manager connected to the WebSocket URL.
   *
   * @throws {ServiceException} When the connection fails.
   */
  static fromWebSocketUrl(url: string): Promise<GameManager> {
    return new Promise((resolve, reject) => {
      const socket = new EventMessageWebSocket(url);
      const errorCallback = (err: any) => {
        reject(
          new ServiceException({
            title: "Game server connection error.",
            details:
              "Cannot connect to the game server at the moment. Please try again later.",
          }),
        );
      };
      socket.addEventListener("error", errorCallback, { once: true });
      socket.addEventListener("open", () => {
        const gameManager = new GameManager(socket);
        socket.removeEventListener("error", errorCallback);
        resolve(gameManager);
      });
    });
  }

  /**
   * Creates a new game to the server.
   *
   * @throws {ServiceException} When connection fails.
   */
  async createGame(createGameDto: CreateGameDto): Promise<Game> {
    const gameInfo = await this.socket.sendMessageWithResponse<GameInfoDto>({
      event: "create",
      data: createGameDto,
    });
    return new Game(this.socket, gameInfo, true);
  }

  async joinGame(joinGameDto: JoinGameDto): Promise<Game> {
    const gameInfo = await this.socket.sendMessageWithResponse<GameInfoDto>({
      event: "join",
      data: joinGameDto,
    });
    return new Game(this.socket, gameInfo, false);
  }

  /**
   * Closes the socket associated with the game manager
   */
  close() {
    this.socket.close();
  }
}
