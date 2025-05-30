import { ServerOptions, WebSocketServer } from "ws";
import {
  ConsoleLogger,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayDisconnect,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
  OnGatewayInit,
} from "@nestjs/websockets";

import {
  CreateGameDto,
  EndGameDto,
  GameInfoDto,
  JoinGameDto,
  NewMoveSuccessDto,
  NewMoveDto,
  OpponentMoveDto,
} from "chess-shared-types";
import {
  RoomService,
  WebSocketJoiValidationPipe,
  WebSocketExceptionFilter,
} from "../ws";
import { GameService } from "./services/game.service";
import {
  createGameDtoSchema,
  joinGameDtoSchema,
  newMoveDtoSchema,
} from "./game.validator";
import { GameSocket } from "./types";
import { GameGuard, GameGuardWithResponse } from "./game.guard";
import { CurrentGame } from "./game.decorator";
import { GameExceptionInterceptor } from "./game-exception.interceptor";

const serverOptions: ServerOptions = {
  path: "/games",
};

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway(serverOptions)
export class GameGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService<GameSocket>,
    private readonly logger: ConsoleLogger,
  ) {
    this.gameService.on("timeout", (gameInfo, gameResult) => {
      this.roomService.emit(gameInfo.id, {
        event: "end",
        data: { gameResult },
      });
      this.cleanUpGameSockets(gameInfo.id);
    });
  }

  onModuleDestroy() {
    clearInterval(this.heartbeatInterval);
  }

  /**
   * Removes game-related info from the sockets.
   */
  private cleanUpSocket(socket: GameSocket) {
    if (socket.gameId) {
      this.roomService.leave(socket.gameId, socket);
      socket.gameId = undefined;
    }
  }

  /**
   * Cleans up all sockets belonging to the specified game.
   */
  private cleanUpGameSockets(gameId: string) {
    const roomSockets = this.roomService.getSockets(gameId);
    if (roomSockets) {
      for (const roomSocket of roomSockets) {
        this.cleanUpSocket(roomSocket);
      }
    }
  }

  private playerLeave(gameId: string, socket: GameSocket) {
    const { isHost, gameResult } = this.gameService.leave(gameId, socket.id);
    if (gameResult) {
      const endGameDto: EndGameDto = {
        gameResult,
      };
      this.roomService.emit(
        gameId,
        {
          event: "end",
          data: endGameDto,
        },
        {
          exclude: [socket.id],
        },
      );
    } else if (isHost) {
      this.roomService.emit(
        gameId,
        {
          event: "waiting-room-end",
        },
        {
          exclude: [socket.id],
        },
      );
    } else {
      this.roomService.emit(
        gameId,
        {
          event: "waiting-room-leave",
        },
        {
          exclude: [socket.id],
        },
      );
    }

    if (gameResult || isHost) {
      this.cleanUpGameSockets(gameId);
    } else {
      this.cleanUpSocket(socket);
    }
  }

  @SubscribeMessage("heartbeat")
  handleHeartbeat(@ConnectedSocket() socket: GameSocket) {
    socket.isAlive = true;
    return {
      event: "heartbeat:success",
    };
  }

  afterInit(server: WebSocketServer) {
    this.heartbeatInterval = setInterval(() => {
      for (const socket of server.clients) {
        const gameSocket = socket as unknown as GameSocket;
        if (!gameSocket.isAlive) {
          this.logger.log(
            `Client ${gameSocket.id} inactive. Terminating connection.`,
          );
          gameSocket.terminate();
        }

        gameSocket.isAlive = false;
      }
    }, 15_000);
  }

  handleConnection(socket: GameSocket) {
    socket.isAlive = true;
  }

  handleDisconnect(socket: GameSocket) {
    try {
      if (socket.gameId) {
        this.playerLeave(socket.gameId, socket);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @SubscribeMessage("create")
  @UseInterceptors(GameExceptionInterceptor)
  handleCreate(
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(
      new WebSocketJoiValidationPipe(
        createGameDtoSchema.required(),
        "create:error",
      ),
    )
    createGameDto: CreateGameDto,
  ): WsResponse<GameInfoDto> {
    const gameInfo = this.gameService.create(
      {
        id: socket.id,
        name: socket.user?.username || "Guest",
        userId: socket.user?.id,
      },
      createGameDto,
    );
    this.roomService.join(gameInfo.id, socket);
    socket.gameId = gameInfo.id;
    return {
      event: "create:success",
      data: gameInfo,
    };
  }

  @SubscribeMessage("join")
  @UseInterceptors(GameExceptionInterceptor)
  handleJoin(
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(
      new WebSocketJoiValidationPipe(
        joinGameDtoSchema.required(),
        "join:error",
      ),
    )
    joinGameDto: JoinGameDto,
  ): WsResponse<GameInfoDto> {
    const gameInfo = this.gameService.join(
      {
        id: socket.id,
        name: socket.user?.username || "Guest",
        userId: socket.user?.id,
      },
      joinGameDto,
    );
    this.roomService.join(gameInfo.id, socket);
    socket.gameId = gameInfo.id;
    this.roomService.emit(
      gameInfo.id,
      {
        event: "join",
        data: gameInfo.player,
      },
      {
        exclude: [socket.id],
      },
    );

    return {
      event: "join:success",
      data: gameInfo,
    };
  }

  @SubscribeMessage("leave")
  @UseGuards(GameGuard)
  handleLeave(
    @CurrentGame() gameId: string,
    @ConnectedSocket() socket: GameSocket,
  ) {
    this.playerLeave(gameId, socket);
  }

  @SubscribeMessage("start")
  @UseGuards(GameGuard)
  handleStart(
    @CurrentGame() gameId: string,
    @ConnectedSocket() socket: GameSocket,
  ) {
    const startGameDto = this.gameService.start(gameId, socket.id);
    this.roomService.emit(gameId, {
      event: "start",
      data: startGameDto,
    });
  }

  @SubscribeMessage("move")
  @UseGuards(GameGuardWithResponse)
  @UseInterceptors(GameExceptionInterceptor)
  handleMove(
    @CurrentGame() gameId: string,
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(
      new WebSocketJoiValidationPipe(newMoveDtoSchema.required(), "move:error"),
    )
    newMoveDto: NewMoveDto,
  ): WsResponse<NewMoveSuccessDto> {
    const moveSuccessDto = this.gameService.move(
      gameId,
      newMoveDto.move,
      socket.id,
      {
        pawnPromotionPiece: newMoveDto.pawnPromotionPiece,
      },
    );

    const opponentMoveDto: OpponentMoveDto = {
      move: newMoveDto.move,
      newPosition: moveSuccessDto.newPosition,
      legalMoves: moveSuccessDto.legalMoves,
      gameResult: moveSuccessDto.gameResult,
      remainingTime: moveSuccessDto.remainingTime,
    };

    this.roomService.emit(
      gameId,
      {
        event: "opponent-move",
        data: opponentMoveDto,
      },
      {
        exclude: [socket.id],
      },
    );

    if (moveSuccessDto.gameResult) {
      this.cleanUpGameSockets(gameId);
    }

    return {
      event: "move:success",
      data: moveSuccessDto,
    };
  }

  @SubscribeMessage("resign")
  @UseGuards(GameGuard)
  handleResign(
    @ConnectedSocket() socket: GameSocket,
    @CurrentGame() gameId: string,
  ) {
    const gameResult = this.gameService.resign(gameId, socket.id);
    const endGameDto: EndGameDto = {
      gameResult,
    };
    this.roomService.emit(
      gameId,
      {
        event: "end",
        data: endGameDto,
      },
      {
        exclude: [socket.id],
      },
    );
    this.cleanUpGameSockets(gameId);
  }
}
