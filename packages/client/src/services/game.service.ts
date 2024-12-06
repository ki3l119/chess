import {
  EventMessageWebSocket,
  GameManager,
  ServiceException,
} from "../models";

export class GameService {
  constructor(private readonly webSocketServerBaseUrl: string) {}

  createGameManager(): Promise<GameManager> {
    return new Promise((resolve, reject) => {
      const socket = new EventMessageWebSocket(
        new URL("/games", this.webSocketServerBaseUrl),
      );
      const errorCallback = () => {
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
}
