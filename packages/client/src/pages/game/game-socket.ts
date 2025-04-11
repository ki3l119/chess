import {
  GameInfoDto,
  GameResultDto,
  EndGameDto,
  NewMoveSuccessDto,
  OpponentMoveDto,
  PieceDto,
  PlayerDto,
  StartGameDto,
  CreateGameDto,
  JoinGameDto,
  NewMoveDto,
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
  PromotionPieceName,
  PieceName,
} from "./utils/chess";
import { ServiceException } from "@/services";

type MoveOptions = {
  pawnPromotionPiece?: PromotionPieceName;
};

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

export class SuccessfulMoveEvent extends Event {
  constructor(
    readonly move: Move,
    readonly newPosition: BoardPiece[],
    readonly legalMoves: Move[],
    /**
     * The number of seconds left in the users's clock
     */
    readonly remainingTime: number,
    readonly gameResult?: GameResult,
  ) {
    super("successful-move");
  }
}

export class OpponentMoveEvent extends Event {
  constructor(
    readonly move: Move,
    readonly newPosition: BoardPiece[],
    readonly legalMoves: Move[],
    /**
     * The number of seconds left in the opponent's clock
     */
    readonly remainingTime: number,
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

export class DisconnectEvent extends Event {
  static readonly SERVER_CLOSE = 0;
  static readonly CLIENT_CLOSE = 1;
  static readonly HEARTBEAT_TIMEOUT = 3;
  constructor(readonly cause: number) {
    super("disconnect");
  }
}

interface GameEventMap {
  join: JoinEvent;
  start: StartEvent;
  "opponent-move": OpponentMoveEvent;
  "waiting-room-leave": WaitingRoomLeaveEvent;
  "waiting-room-end": WaitingRoomEndEvent;
  end: EndEvent;
  "successful-move": SuccessfulMoveEvent;
  disconnect: DisconnectEvent;
}

export type GameSocketOptions = {
  heartbeat: {
    /**
     * How long (in seconds) before the next heartbeat is sent after the latest
     * heartbeat response from server.
     */
    interval: number;
    /**
     * How long (in seconds) before the connection is considered disconnected
     * after a heartbeat message has been sent.
     */
    timeout: number;
  };
};

export class GameSocket extends TypedEventTarget<GameEventMap> {
  // Socket message event listeners
  private joinListener: (data: PlayerDto) => void;
  private startListener: (data: StartGameDto) => void;
  private opponentMoveListener: (data: OpponentMoveDto) => void;
  private waitingRoomLeaveListener: () => void;
  private waitingRoomEndListener: () => void;
  private endListener: (data: EndGameDto) => void;
  private heartbeatResponseListener: () => void;

  private onSocketClose: () => void;

  private heartbeat: GameSocketOptions["heartbeat"];
  private heartbeatDisconnectTimeoutId?: number;
  private nextHeartbeatTimeoutId?: number;

  constructor(
    private readonly socket: EventMessageWebSocket,
    options: GameSocketOptions = {
      heartbeat: {
        timeout: 30,
        interval: 10,
      },
    },
  ) {
    super();
    this.heartbeat = options.heartbeat;
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
          data.remainingTime,
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

    this.heartbeatResponseListener = () => {
      if (this.heartbeatDisconnectTimeoutId !== undefined) {
        clearTimeout(this.heartbeatDisconnectTimeoutId);
        this.heartbeatDisconnectTimeoutId = undefined;
      }
      this.nextHeartbeatTimeoutId = setTimeout(() => {
        this.nextHeartbeatTimeoutId = undefined;
        this.sendHeartbeat();
      }, this.heartbeat.interval * 1000);
    };
    this.socket.addMessageListener(
      "heartbeat:success",
      this.heartbeatResponseListener,
    );

    this.onSocketClose = () => {
      this.cleanup();
      this.dispatchTypedEvent(
        "disconnect",
        new DisconnectEvent(DisconnectEvent.SERVER_CLOSE),
      );
    };
    this.socket.addEventListener("close", this.onSocketClose, { once: true });

    this.sendHeartbeat();
  }

  sendHeartbeat() {
    this.socket.sendMessage({ event: "heartbeat" });
    this.heartbeatDisconnectTimeoutId = setTimeout(() => {
      this.cleanup();
      this.socket.close();
      this.dispatchTypedEvent(
        "disconnect",
        new DisconnectEvent(DisconnectEvent.HEARTBEAT_TIMEOUT),
      );
    }, this.heartbeat.timeout * 1000);
  }

  /**
   * Creates a game socket connected to the URL.
   *
   * @throws {ServiceException} When the connection fails.
   */
  static fromWebSocketUrl(url: string): Promise<GameSocket> {
    return new Promise((resolve, reject) => {
      const webSocketUrl = new URL(url);
      if (webSocketUrl.protocol === "http:") {
        webSocketUrl.protocol = "ws:";
      } else if (webSocketUrl.protocol === "https:") {
        webSocketUrl.protocol = "wss:";
      }
      const socket = new EventMessageWebSocket(webSocketUrl.href);
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

  private cleanup() {
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
    this.socket.removeMessageListener(
      "heartbeat:success",
      this.heartbeatResponseListener,
    );
    if (this.heartbeatDisconnectTimeoutId !== undefined) {
      clearTimeout(this.heartbeatDisconnectTimeoutId);
      this.heartbeatDisconnectTimeoutId = undefined;
    }
    if (this.nextHeartbeatTimeoutId !== undefined) {
      clearTimeout(this.nextHeartbeatTimeoutId);
      this.nextHeartbeatTimeoutId = undefined;
    }
    this.socket.removeEventListener("close", this.onSocketClose);
  }

  /**
   * Closes the socket associated with the game socket
   */
  close() {
    this.cleanup();
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      this.dispatchTypedEvent(
        "disconnect",
        new DisconnectEvent(DisconnectEvent.CLIENT_CLOSE),
      );
    }
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

  async move(
    move: Move,
    options: MoveOptions = {},
  ): Promise<{
    newPosition: BoardPiece[];
    legalMoves: Move[];
    gameResult?: GameResult;
    remainingTime: number;
  }> {
    const promotionPieceMapping = {
      [PieceName.QUEEN]: "Q",
      [PieceName.ROOK]: "R",
      [PieceName.KNIGHT]: "N",
      [PieceName.BISHOP]: "B",
    };

    const pawnPromotionPiece =
      options.pawnPromotionPiece &&
      (promotionPieceMapping[
        options.pawnPromotionPiece
      ] as NewMoveDto["pawnPromotionPiece"]);
    const data: NewMoveDto = {
      move,
      pawnPromotionPiece: pawnPromotionPiece,
    };
    const moveSuccessDto =
      await this.socket.sendMessageWithResponse<NewMoveSuccessDto>({
        event: "move",
        data,
      });

    const newPosition = GameSocket.dtoToBoardPieces(moveSuccessDto.newPosition);
    const gameResult =
      moveSuccessDto.gameResult &&
      GameSocket.dtoToGameResult(moveSuccessDto.gameResult);

    this.dispatchTypedEvent(
      "successful-move",
      new SuccessfulMoveEvent(
        move,
        newPosition,
        moveSuccessDto.legalMoves,
        moveSuccessDto.remainingTime,
        gameResult,
      ),
    );

    return {
      newPosition: newPosition,
      legalMoves: moveSuccessDto.legalMoves,
      gameResult: gameResult,
      remainingTime: moveSuccessDto.remainingTime,
    };
  }

  leaveGame() {
    this.socket.sendMessage({
      event: "leave",
    });
  }

  resign() {
    this.socket.sendMessage({
      event: "resign",
    });
  }
}
