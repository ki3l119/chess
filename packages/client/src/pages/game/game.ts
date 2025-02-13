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
    super("opponent-move");
  }
}

export class WaitingRoomLeaveEvent extends Event {
  constructor() {
    super("waiting-room-leave");
  }
}

export class WaitingRoomEndEvent extends Event {
  constructor() {
    super("waiting-room-end");
  }
}

interface GameEventMap {
  join: JoinEvent;
  start: StartEvent;
  "opponent-move": OpponentMoveEvent;
  "waiting-room-leave": WaitingRoomLeaveEvent;
  "waiting-room-end": WaitingRoomEndEvent;
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

  // Socket message event listeners
  private joinListener: (data: PlayerDto) => void;
  private startListener: (data: StartGameDto) => void;
  private opponentMoveListener: (data: OpponentMoveDto) => void;
  private waitingRoomLeaveListener: () => void;
  private waitingRoomEndListener: () => void;

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
    this.joinListener = (data) => {
      const player = Game.dtoToPlayer(data);
      this.player = player;
      this.dispatchTypedEvent("join", new JoinEvent(player));
    };
    this.socket.addMessageListener("join", this.joinListener);

    this.startListener = (data) => {
      this.pieces = Game.dtoToBoardPieces(data.pieces);
      this.legalMoves = data.legalMoves;
      this.dispatchTypedEvent(
        "start",
        new StartEvent(this.getPieces(), this.getLegalMoves()),
      );
    };
    this.socket.addMessageListener("start", this.startListener);

    this.opponentMoveListener = (data) => {
      this.pieces = Game.dtoToBoardPieces(data.newPosition);
      this.legalMoves = data.legalMoves;
      this.dispatchTypedEvent(
        "opponent-move",
        new OpponentMoveEvent(
          data.move,
          this.getPieces(),
          this.getLegalMoves(),
        ),
      );
    };
    this.socket.addMessageListener("opponent-move", this.opponentMoveListener);

    this.waitingRoomEndListener = () => {
      this.dispatchTypedEvent("waiting-room-end", new WaitingRoomEndEvent());
    };
    this.socket.addMessageListener(
      "waiting-room-end",
      this.waitingRoomEndListener,
    );

    this.waitingRoomLeaveListener = () => {
      this.dispatchTypedEvent(
        "waiting-room-leave",
        new WaitingRoomLeaveEvent(),
      );
    };
    this.socket.addMessageListener(
      "waiting-room-leave",
      this.waitingRoomLeaveListener,
    );
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

  leave() {
    this.socket.sendMessage({
      event: "leave",
    });
  }

  /**
   * Cleans up resources used by game.
   */
  close() {
    this.socket.removeMessageListener("join", this.joinListener);
    this.socket.removeMessageListener("start", this.startListener);
    this.socket.removeMessageListener(
      "opponent-move",
      this.opponentMoveListener,
    );
    this.socket.removeMessageListener(
      "waiting-room-end",
      this.waitingRoomEndListener,
    );
    this.socket.removeMessageListener(
      "waiting-room-leave",
      this.waitingRoomLeaveListener,
    );
  }
}
