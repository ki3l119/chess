import { GameInfoDto, PlayerDto, StartGameDto } from "chess-shared-types";
import { EventMessageWebSocket } from "@/ws";
import { TypedEventTarget } from "typescript-event-target";
import { BoardPiece, PieceColor, PIECES } from "./utils/chess";

export class JoinEvent extends Event {
  constructor(public readonly player: Player) {
    super("join");
  }
}

export class StartEvent extends Event {
  constructor(public readonly startingPieces: BoardPiece[]) {
    super("start");
  }
}

interface GameEventMap {
  join: JoinEvent;
  start: StartEvent;
}

export type Player = {
  name: string;
  color: PieceColor;
};

export class Game extends TypedEventTarget<GameEventMap> {
  private pieces: BoardPiece[] = [];
  private id: string;

  private host: Player;
  private player?: Player;

  constructor(
    private readonly socket: EventMessageWebSocket,
    id: string,
    host: Player,
    readonly isHost: boolean,
    player?: Player,
  ) {
    super();
    this.host = host;
    this.id = id;
    if (player) {
      this.player = player;
    }
    this.socket.addMessageListener("join", (data: PlayerDto) => {
      const player = Game.dtoToPlayer(data);
      this.player = player;
      this.dispatchTypedEvent("join", new JoinEvent(player));
    });
    this.socket.addMessageListener("start", (data: StartGameDto) => {
      this.pieces = data.pieces.map((pieceDto) => ({
        type: PIECES[pieceDto.piece],
        coordinate: pieceDto.coordinate,
      }));
      this.dispatchTypedEvent("start", new StartEvent(this.pieces));
    });
  }

  /**
   * Creates a new game from the GameInfoDto
   */
  static fromGameInfoDto(
    socket: EventMessageWebSocket,
    gameInfoDto: GameInfoDto,
    isHost: boolean,
  ) {
    return new Game(
      socket,
      gameInfoDto.id,
      Game.dtoToPlayer(gameInfoDto.host),
      isHost,
      gameInfoDto.player ? Game.dtoToPlayer(gameInfoDto.player) : undefined,
    );
  }

  private static dtoToPlayer(playerDto: PlayerDto): Player {
    return {
      name: playerDto.name,
      color: playerDto.color === "WHITE" ? PieceColor.WHITE : PieceColor.BLACK,
    };
  }

  start() {
    this.socket.sendMessage({
      event: "start",
    });
  }

  getId(): string {
    return this.id;
  }

  getHost(): Player {
    return this.host;
  }

  /**
   * @returns The host's opponent.
   */
  getPlayer(): Player | undefined {
    return this.player;
  }

  /**
   * @returns The player associated with the current user of the app.
   */
  getUserPlayer(): Player {
    const userPlayer = this.isHost ? this.host : this.player;
    if (!userPlayer) {
      throw new Error(
        "Invalid game state. Current user is not part of the game.",
      );
    }
    return userPlayer;
  }

  getPieces(): BoardPiece[] {
    return [...this.pieces];
  }
}
