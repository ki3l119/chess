import {
  GameInfoDto,
  MoveDto,
  MoveSuccessDto,
  OpponentMoveDto,
  PieceDto,
  PlayerDto,
  StartGameDto,
} from "chess-shared-types";
import { EventMessageWebSocket } from "@/ws";
import { TypedEventTarget } from "typescript-event-target";
import { BoardPiece, PieceColor, PIECES } from "./utils/chess";

export class JoinEvent extends Event {
  constructor(public readonly player: Player) {
    super("join");
  }
}

export class StartEvent extends Event {
  constructor(
    public readonly startingPieces: BoardPiece[],
    public readonly legalMoves: MoveDto[],
  ) {
    super("start");
  }
}

export class OpponentMoveEvent extends Event {
  constructor(
    readonly move: MoveDto,
    readonly newPosition: BoardPiece[],
    readonly legalMoves: MoveDto[],
  ) {
    super("opponentmove");
  }
}

interface GameEventMap {
  join: JoinEvent;
  start: StartEvent;
  opponentmove: OpponentMoveEvent;
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

  private legalMoves: MoveDto[];

  constructor(
    private readonly socket: EventMessageWebSocket,
    id: string,
    host: Player,
    readonly isHost: boolean,
    player?: Player,
  ) {
    super();
    this.legalMoves = [];
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
      this.pieces = Game.dtoToBoardPieces(data.pieces);
      this.legalMoves = data.legalMoves;
      this.dispatchTypedEvent(
        "start",
        new StartEvent(this.getPieces(), this.getLegalMoves()),
      );
    });
    this.socket.addMessageListener("opponent-move", (data: OpponentMoveDto) => {
      this.pieces = Game.dtoToBoardPieces(data.newPosition);
      this.legalMoves = data.legalMoves;
      this.dispatchTypedEvent(
        "opponentmove",
        new OpponentMoveEvent(
          data.move,
          this.getPieces(),
          this.getLegalMoves(),
        ),
      );
    });
  }

  private static dtoToBoardPieces(pieceDtos: PieceDto[]): BoardPiece[] {
    return pieceDtos.map((pieceDto) => ({
      type: PIECES[pieceDto.piece],
      coordinate: pieceDto.coordinate,
    }));
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

  /**
   * @returns The opponent of the current user.
   */
  getOpponent(): Player {
    const opponent = this.isHost ? this.player : this.host;
    if (!opponent) {
      throw new Error(
        "Invalid game state. Opponent of  player is not defined.",
      );
    }
    return opponent;
  }

  getPieces(): BoardPiece[] {
    return [...this.pieces];
  }

  getLegalMoves(): MoveDto[] {
    return [...this.legalMoves];
  }

  async move(
    moveDto: MoveDto,
  ): Promise<{ newPosition: BoardPiece[]; legalMoves: MoveDto[] }> {
    const moveSuccessDto =
      await this.socket.sendMessageWithResponse<MoveSuccessDto>({
        event: "move",
        data: moveDto,
      });

    this.pieces = Game.dtoToBoardPieces(moveSuccessDto.newPosition);
    this.legalMoves = [...moveSuccessDto.legalMoves];

    return {
      newPosition: this.pieces,
      legalMoves: this.legalMoves,
    };
  }
}
