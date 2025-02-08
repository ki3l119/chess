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
    const startGameDto = this.gameService.start(gameId);
    this.roomService.emit(gameId, {
      event: "start",
      data: startGameDto,
    });
  }

  @SubscribeMessage("move")
  @UseGuards(GameGuard)
  handleMove(
    @CurrentGame() gameId: string,
    @ConnectedSocket() socket: GameSocket,
    @MessageBody(new WebSocketJoiValidationPipe(moveDtoSchema, "move:error"))
    moveDto: MoveDto,
  ): WsResponse<MoveSuccessDto> {
    try {
      const moveSuccessDto = this.gameService.move(gameId, moveDto);

      const opponentMoveDto: OpponentMoveDto = {
        move: moveDto,
        newPosition: moveSuccessDto.newPosition,
        legalMoves: moveSuccessDto.legalMoves,
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
    } catch (e) {
      if (e instanceof GameException) {
        throw new WebSocketException("move:error", e.problemDetails);
      }
      throw e;
    }
  }
}
