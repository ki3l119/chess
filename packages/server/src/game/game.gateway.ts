import { ServerOptions } from "ws";
import { UseFilters } from "@nestjs/common";
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
  CreateGameSuccessDto,
  JoinGameSuccessDto,
  JoinGameDto,
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

  handleDisconnect(socket: WebSocketExtended) {
    const gameId = this.gameService.findPlayerGame(socket.id);
    if (gameId !== null) {
      this.gameService.delete(gameId);
      this.roomService.leave(gameId, socket);
    }
  }

  @SubscribeMessage("create")
  handleCreate(
    @ConnectedSocket() socket: WebSocketExtended,
    @MessageBody(
      new WebSocketJoiValidationPipe(createGameDtoSchema, "create:error"),
    )
    createGameDto: CreateGameDto,
  ): WsResponse<CreateGameSuccessDto> {
    try {
      const gameId = this.gameService.create(
        {
          id: socket.id,
          name: socket.user?.username,
        },
        createGameDto,
      );
      this.roomService.join(gameId, socket);
      return {
        event: "create:success",
        data: {
          gameId: gameId,
        },
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
    @ConnectedSocket() socket: WebSocketExtended,
    @MessageBody(
      new WebSocketJoiValidationPipe(joinGameDtoSchema, "join:error"),
    )
    joinGameDto: JoinGameDto,
  ): WsResponse<JoinGameSuccessDto> {
    try {
      const joinResult = this.gameService.join(
        { id: socket.id, name: socket.user?.username },
        joinGameDto,
      );
      this.roomService.join(joinResult.gameId, socket);

      this.roomService.emit(
        joinResult.gameId,
        {
          event: "join",
          data: {
            player: joinResult.player.name,
          },
        },
        {
          exclude: [socket.id],
        },
      );

      return {
        event: "join:success",
        data: {
          gameId: joinResult.gameId,
          you: joinResult.player.name,
          opponent: joinResult.host.name,
          color: joinResult.player.color,
        },
      };
    } catch (e) {
      if (e instanceof GameException) {
        throw new WebSocketException("join:error", e.problemDetails);
      }
      throw e;
    }
  }
}
