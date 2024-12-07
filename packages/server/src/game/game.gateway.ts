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
    const player = this.gameService.findPlayerById(socket.id);
    if (player) {
      this.roomService.leave(player.gameId, socket);
    }
    this.gameService.removePlayer(socket.id);
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
      const { gameId } = this.gameService.create(
        { id: socket.id, user: socket.user },
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
      const { waitingRoom, host } = this.gameService.join(
        { id: socket.id, user: socket.user },
        joinGameDto,
      );
      this.roomService.join(waitingRoom.gameId, socket);
      const playerName = socket.user?.username || "Guest";
      this.roomService.emit(
        waitingRoom.gameId,
        {
          event: "join",
          data: {
            player: playerName,
          },
        },
        {
          exclude: [socket.id],
        },
      );

      if (!waitingRoom.opponent) {
        throw new Error(
          "Opponent not defined for waiting room even after joining.",
        );
      }

      return {
        event: "join:success",
        data: {
          gameId: waitingRoom.gameId,
          you: socket.user?.username || "Guest",
          opponent: host.user?.username || "Guest",
          color: waitingRoom.opponent!.color,
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
