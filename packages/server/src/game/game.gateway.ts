import { ServerOptions } from "ws";
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
} from "@nestjs/websockets";

import {
  CreateGameDto,
  EndGameDto,
  GameInfoDto,
  JoinGameDto,
  MoveDto,
  MoveSuccessDto,
  OpponentMoveDto,
} from "chess-shared-types";
import {
  WebSocketException,
  RoomService,
  WebSocketJoiValidationPipe,
  WebSocketExceptionFilter,
} from "../ws";
import { GameService } from "./game.service";
import {
  createGameDtoSchema,
  joinGameDtoSchema,
  moveDtoSchema,
} from "./game.validator";
import { GameException } from "./game.exception";
import { GameSocket } from "./types";
import { GameGuard, GameGuardWithResponse } from "./game.guard";
import { CurrentGame } from "./game.decorator";
import { GameExceptionInterceptor } from "./game-exception.interceptor";

const serverOptions: ServerOptions = {
  path: "/games",
};

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway(serverOptions)
export class GameGateway implements OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
    private readonly logger: ConsoleLogger,
  ) {}

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
      new WebSocketJoiValidationPipe(createGameDtoSchema, "create:error"),
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
      new WebSocketJoiValidationPipe(joinGameDtoSchema, "join:error"),
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
    @MessageBody(new WebSocketJoiValidationPipe(moveDtoSchema, "move:error"))
    moveDto: MoveDto,
  ): WsResponse<MoveSuccessDto> {
    const moveSuccessDto = this.gameService.move(gameId, moveDto, socket.id);

    const opponentMoveDto: OpponentMoveDto = {
      move: moveDto,
      newPosition: moveSuccessDto.newPosition,
      legalMoves: moveSuccessDto.legalMoves,
      gameResult: moveSuccessDto.gameResult,
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

    return {
      event: "move:success",
      data: moveSuccessDto,
    };
  }
}
