import { TypedEventTarget } from "typescript-event-target";

import {
  CreateGameDto,
  CreateGameSuccessDto,
  ProblemDetails,
  NewPlayerDto,
} from "chess-shared-types";
import { EventMessageWebSocket } from "./event-message-ws";
import { ServiceException } from "./service.exception";

export class JoinEvent extends Event {
  constructor(public readonly newPlayer: NewPlayerDto) {
    super("join");
  }
}

interface GameManagerEventMap {
  join: JoinEvent;
}

export class GameManager extends TypedEventTarget<GameManagerEventMap> {
  constructor(private readonly socket: EventMessageWebSocket) {
    super();
    this.socket.addEventMessageHandler("join", (data: NewPlayerDto) => {
      this.dispatchTypedEvent("join", new JoinEvent(data));
    });
  }

  createGame(createGameDto: CreateGameDto): Promise<CreateGameSuccessDto> {
    let successCallback: (data: CreateGameSuccessDto) => void | undefined;
    let errorCallback: (problemDetails: ProblemDetails) => void | undefined;
    return new Promise<CreateGameSuccessDto>((resolve, reject) => {
      successCallback = (data) => {
        resolve(data);
      };
      errorCallback = (problemDetails) => {
        reject(new ServiceException(problemDetails));
      };

      this.socket.addEventMessageHandler("create:success", successCallback);
      this.socket.addEventMessageHandler("create:error", errorCallback);
      this.socket.sendEventMessage({
        event: "create",
        data: createGameDto,
      });
    }).finally(() => {
      this.socket.removeEventMessageHandler("create:success", successCallback);
      this.socket.removeEventMessageHandler("create:error", errorCallback);
    });
  }

  close() {
    this.socket.close();
  }
}
