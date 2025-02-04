import { TypedEventTarget } from "typescript-event-target";

import {
  CreateGameDto,
  CreateGameSuccessDto,
  NewPlayerDto,
  JoinGameDto,
  JoinGameSuccessDto,
} from "chess-shared-types";
import { EventMessageWebSocket } from "@/ws/event-message-ws";

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
    this.socket.addMessageListener("join", (data: NewPlayerDto) => {
      this.dispatchTypedEvent("join", new JoinEvent(data));
    });
  }

  createGame(createGameDto: CreateGameDto): Promise<CreateGameSuccessDto> {
    return this.socket.sendMessageWithResponse<CreateGameSuccessDto>({
      event: "create",
      data: createGameDto,
    });
  }

  joinGame(joinGameDto: JoinGameDto): Promise<JoinGameSuccessDto> {
    return this.socket.sendMessageWithResponse<JoinGameSuccessDto>({
      event: "join",
      data: joinGameDto,
    });
  }

  close() {
    this.socket.close();
  }
}
