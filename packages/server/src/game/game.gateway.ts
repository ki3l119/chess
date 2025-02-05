import { ServerOptions } from "ws";
import { UseFilters, UseGuards } from "@nestjs/common";
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
  GameInfoDto,
  JoinGameDto,
  StartGameDto,
} from "chess-shared-types";
import {
  type WebSocketExtended,
  WebSocketException,
  RoomService,
  WebSocketJoiValidationPipe,
  WebSocketExceptionFilter,
} from "../ws";
import { GameService } from "./game.service";
import { createGameDtoSchema, joinGameDtoSchema } from "./game.validator";
import { GameException } from "./game.exception";
import { GameSocket } from "./types";
import { GameGuard } from "./game.guard";
import { CurrentGame } from "./game.decorator";

const serverOptions: ServerOptions = {
  path: "/games",
};

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway(serverOptions)
export class GameGateway implements OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
  ) {}

  handleDisconnect(socket: GameSocket) {
    if (socket.gameId) {
      this.gameService.delete(socket.gameId);
      this.roomService.leave(socket.gameId, socket);
    }
  }

  @SubscribeMessage("create")
  handleCreate(
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(
      new WebSocketJoiValidationPipe(createGameDtoSchema, "create:error"),
    )
    createGameDto: CreateGameDto,
  ): WsResponse<GameInfoDto> {
    try {
      const gameInfo = this.gameService.create(
        {
          id: socket.id,
          name: socket.user?.username,
        },
        createGameDto,
      );
      this.roomService.join(gameInfo.id, socket);
      socket.gameId = gameInfo.id;
      return {
        event: "create:success",
        data: gameInfo,
      };
    } catch (e) {
      if (e instanceof GameException) {
        throw new WebSocketException("create:error", e.problemDetails);
      }
      throw e;
    }
  }

  @SubscribeMessage("join")
  handleJoin(
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(
      new WebSocketJoiValidationPipe(joinGameDtoSchema, "join:error"),
    )
    joinGameDto: JoinGameDto,
  ): WsResponse<GameInfoDto> {
    try {
      const gameInfo = this.gameService.join(
        { id: socket.id, name: socket.user?.username },
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
    } catch (e) {
      if (e instanceof GameException) {
        throw new WebSocketException("join:error", e.problemDetails);
      }
      throw e;
    }
  }

  @SubscribeMessage("start")
  @UseGuards(GameGuard)
  handleStart(@CurrentGame() gameId: string) {
    const pieces = this.gameService.start(gameId);
    const startGameDto: StartGameDto = {
      pieces,
    };
    this.roomService.emit(gameId, {
      event: "start",
      data: startGameDto,
    });
  }
}
