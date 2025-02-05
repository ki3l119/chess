import { GameInfoDto, PlayerDto } from "chess-shared-types";
import { EventMessageWebSocket } from "@/ws";
import { TypedEventTarget } from "typescript-event-target";

export class JoinEvent extends Event {
  constructor(public readonly player: PlayerDto) {
    super("join");
  }
}

interface GameEventMap {
  join: JoinEvent;
}

export class Game extends TypedEventTarget<GameEventMap> {
  constructor(
    private readonly socket: EventMessageWebSocket,
    private readonly info: GameInfoDto,
    readonly isHost: boolean,
  ) {
    super();
    this.socket.addMessageListener("join", (data: PlayerDto) => {
      this.info.player = data;
      this.dispatchTypedEvent("join", new JoinEvent(data));
    });
  }

  start() {
    this.socket.sendMessage({
      event: "start",
    });
  }

  getId(): string {
    return this.info.id;
  }

  getHost(): PlayerDto {
    return this.info.host;
  }

  getPlayer(): PlayerDto | undefined {
    return this.info.player;
  }
}
