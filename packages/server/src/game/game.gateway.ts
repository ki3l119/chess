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
import { PieceColor } from "./models/game";
import { GameService } from "./game.service";
import { createGameDtoSchema, joinGameDtoSchema } from "./game.validator";

const serverOptions: ServerOptions = {
  path: "/games",
};

type WebSocketPlayer = WebSocketExtended & {
  player?: {
    gameId: string;
    color: PieceColor;
  };
};

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway(serverOptions)
export class GameGateway implements OnGatewayDisconnect {
  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
  ) {}

  handleDisconnect(socket: WebSocketPlayer) {
    if (socket.player) {
      const remainingPlayers = this.roomService.getSocketCount(
        socket.player.gameId,
      );
      if (remainingPlayers === 1) {
        this.gameService.delete(socket.player.gameId);
      }
      this.roomService.leave(socket.player.gameId, socket);
    }
  }

  @SubscribeMessage("create")
  handleCreate(
    @ConnectedSocket() socket: WebSocketPlayer,
    @MessageBody(
      new WebSocketJoiValidationPipe(createGameDtoSchema, "create:error"),
    )
    createGameDto: CreateGameDto,
  ): WsResponse<CreateGameSuccessDto> {
    if (socket.player) {
      throw new WebSocketException("create:error", {
        title: "Cannot create game.",
        details: "You are already part of an existing game.",
      });
    }

    const { color, gameId } = this.gameService.create(createGameDto);
    this.roomService.join(gameId, socket);
    socket.player = {
      gameId,
      color,
    };

    return {
      event: "create:success",
      data: {
        gameId,
      },
    };
  }

  @SubscribeMessage("join")
  handleJoin(
    @ConnectedSocket() socket: WebSocketPlayer,
    @MessageBody(
      new WebSocketJoiValidationPipe(joinGameDtoSchema, "join:error"),
    )
    joinGameDto: JoinGameDto,
  ): WsResponse<JoinGameSuccessDto> {
    if (socket.player) {
      throw new WebSocketException("join:error", {
        title: "Cannot join game.",
        details: "You are already part of an existing game.",
      });
    }

    const gameExist = this.gameService.checkExists(joinGameDto.gameId);

    if (!gameExist) {
      throw new WebSocketException("join:error", {
        title: "Cannot join game.",
        details: "The game does not exist.",
      });
    }

    const roomSockets = this.roomService.getSockets(joinGameDto.gameId);

    if (!roomSockets) {
      throw new WebSocketException("join:error", {
        title: "Cannot join game.",
        details: "An unexpected error has occured.",
      });
    }

    const hostSocket: WebSocketPlayer = roomSockets[0];

    const hostPlayerName = hostSocket.user?.username || "Guest";

    const joiningPlayerName = socket.user?.username || "Guest";

    this.roomService.join(joinGameDto.gameId, socket);

    socket.player = {
      gameId: joinGameDto.gameId,
      color:
        hostSocket.player!.color === PieceColor.WHITE
          ? PieceColor.BLACK
          : PieceColor.WHITE,
    };

    this.roomService.emit(
      joinGameDto.gameId,
      { event: "join", data: { player: joiningPlayerName } },
      {
        exclude: [socket.id],
      },
    );

    return {
      event: "join:success",
      data: {
        gameId: joinGameDto.gameId,
        you: joiningPlayerName,
        opponent: hostPlayerName,
        color: socket.player.color,
      },
    };
  }
}
