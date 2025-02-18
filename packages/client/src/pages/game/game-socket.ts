import {
  GameInfoDto,
  GameResultDto,
  EndGameDto,
  MoveSuccessDto,
  OpponentMoveDto,
  PieceDto,
  PlayerDto,
  StartGameDto,
  CreateGameDto,
  JoinGameDto,
} from "chess-shared-types";
import { EventMessageWebSocket } from "@/ws";
import { TypedEventTarget } from "typescript-event-target";
import {
  BoardPiece,
  GameInfo,
  PieceColor,
  PIECES,
  Player,
  GameResult,
  Move,
} from "./utils/chess";
import { ServiceException } from "@/services";

export class JoinEvent extends Event {
  constructor(public readonly player: Player) {
    super("join");
  }
}

export class StartEvent extends Event {
  constructor(
    public readonly startingPieces: BoardPiece[],
    public readonly legalMoves: Move[],
  ) {
    super("start");
  }
}

export class OpponentMoveEvent extends Event {
  constructor(
    readonly move: Move,
    readonly newPosition: BoardPiece[],
    readonly legalMoves: Move[],
    readonly gameResult?: GameResult,
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

export class EndEvent extends Event {
  constructor(readonly gameResult: GameResult) {
    super("end");
  }
}
interface GameEventMap {
  join: JoinEvent;
  start: StartEvent;
  "opponent-move": OpponentMoveEvent;
  "waiting-room-leave": WaitingRoomLeaveEvent;
  "waiting-room-end": WaitingRoomEndEvent;
  end: EndEvent;
}

export class GameSocket extends TypedEventTarget<GameEventMap> {
  // Socket message event listeners
  private joinListener: (data: PlayerDto) => void;
  private startListener: (data: StartGameDto) => void;
  private opponentMoveListener: (data: OpponentMoveDto) => void;
  private waitingRoomLeaveListener: () => void;
  private waitingRoomEndListener: () => void;
  private endListener: (data: EndGameDto) => void;

  constructor(private readonly socket: EventMessageWebSocket) {
    super();
    this.joinListener = (data) => {
      const player = GameSocket.dtoToPlayer(data);
      this.dispatchTypedEvent("join", new JoinEvent(player));
    };
    this.socket.addMessageListener("join", this.joinListener);

    this.startListener = (data) => {
      this.dispatchTypedEvent(
        "start",
        new StartEvent(
          GameSocket.dtoToBoardPieces(data.pieces),
          data.legalMoves,
        ),
      );
    };
    this.socket.addMessageListener("start", this.startListener);

    this.opponentMoveListener = (data) => {
      this.dispatchTypedEvent(
        "opponent-move",
        new OpponentMoveEvent(
          data.move,
          GameSocket.dtoToBoardPieces(data.newPosition),
          data.legalMoves,
          data.gameResult && GameSocket.dtoToGameResult(data.gameResult),
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

    this.endListener = (data) => {
      this.dispatchTypedEvent(
        "end",
        new EndEvent(GameSocket.dtoToGameResult(data.gameResult)),
      );
    };
    this.socket.addMessageListener("end", this.endListener);
  }

  /**
   * Creates a game socket connected to the URL.
   *
   * @throws {ServiceException} When the connection fails.
   */
  static fromWebSocketUrl(url: string): Promise<GameSocket> {
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
        const gameSocket = new GameSocket(socket);
        socket.removeEventListener("error", errorCallback);
        resolve(gameSocket);
      });
    });
  }

  /**
   * Creates a new game to the server.
   *
   * @throws {ServiceException} When connection fails.
   */
  async createGame(createGameDto: CreateGameDto): Promise<GameInfo> {
    const gameInfoDto = await this.socket.sendMessageWithResponse<GameInfoDto>({
      event: "create",
      data: createGameDto,
    });
    return GameSocket.dtoToGameInfo(gameInfoDto, true);
  }

  /**
   * Joins an existing game.
   *
   * @throws {ServiceException} On join failure.
   */
  async joinGame(joinGameDto: JoinGameDto): Promise<GameInfo> {
    const gameInfoDto = await this.socket.sendMessageWithResponse<GameInfoDto>({
      event: "join",
      data: joinGameDto,
    });
    return GameSocket.dtoToGameInfo(gameInfoDto, false);
  }

  /**
   * Closes the socket associated with the game socket
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
    this.socket.removeMessageListener("end", this.endListener);
    this.socket.close();
  }

  private static dtoToGameInfo(
    gameInfoDto: GameInfoDto,
    isHost: boolean,
  ): GameInfo {
    return {
      id: gameInfoDto.id,
      host: GameSocket.dtoToPlayer(gameInfoDto.host),
      player: gameInfoDto.player && GameSocket.dtoToPlayer(gameInfoDto.player),
      isHost,
      playerTimerDuration: gameInfoDto.playerTimerDuration,
    };
  }

  private static dtoToBoardPieces(pieceDtos: PieceDto[]): BoardPiece[] {
    return pieceDtos.map((pieceDto) => ({
      type: PIECES[pieceDto.piece],
      coordinate: pieceDto.coordinate,
    }));
  }

  private static dtoToPlayer(playerDto: PlayerDto): Player {
    return {
      name: playerDto.name,
      color: playerDto.color === "WHITE" ? PieceColor.WHITE : PieceColor.BLACK,
    };
  }

  private static dtoToGameResult(gameResultDto: GameResultDto): GameResult {
    return {
      winner:
        gameResultDto.winner &&
        (gameResultDto.winner === "BLACK"
          ? PieceColor.BLACK
          : PieceColor.WHITE),
      reason: gameResultDto.reason,
    };
  }

  startGame() {
    this.socket.sendMessage({
      event: "start",
    });
  }

  async move(move: Move): Promise<{
    newPosition: BoardPiece[];
    legalMoves: Move[];
    gameResult?: GameResult;
  }> {
    const moveSuccessDto =
      await this.socket.sendMessageWithResponse<MoveSuccessDto>({
        event: "move",
        data: move,
      });

    return {
      newPosition: GameSocket.dtoToBoardPieces(moveSuccessDto.newPosition),
      legalMoves: moveSuccessDto.legalMoves,
      gameResult:
        moveSuccessDto.gameResult &&
        GameSocket.dtoToGameResult(moveSuccessDto.gameResult),
    };
  }

  leaveGame() {
    this.socket.sendMessage({
      event: "leave",
    });
  }
}
