import { randomUUID } from "crypto";
import { Injectable, Logger } from "@nestjs/common";

import {
  CreateGameDto,
  JoinGameDto,
  PieceColorChoice,
  UserDto,
} from "chess-shared-types";
import {
  InvalidGameCreationException,
  InvalidGameJoinException,
  GameNotFoundException,
} from "./game.exception";
import { Game } from "./models/game";

type WaitingPlayer = {
  playerId: string;
  color: PieceColorChoice;
};
type WaitingRoom = {
  gameId: string;
  host: WaitingPlayer;
  opponent?: WaitingPlayer;
};

type Player = {
  id: string;
  user?: UserDto;
  gameId: string;
};

@Injectable()
export class GameService {
  private readonly games: Map<string, Game>;
  private readonly waitingRooms: Map<string, WaitingRoom>;
  private readonly players: Map<string, Player>;
  private readonly logger: Logger;

  constructor() {
    this.games = new Map();
    this.logger = new Logger(GameService.name);
    this.players = new Map();
    this.waitingRooms = new Map();
  }

  /**
   * Creates a new waiting room for a game.
   */
  create(
    player: Pick<Player, "id" | "user">,
    createGameDto: CreateGameDto,
  ): WaitingRoom {
    if (this.players.get(player.id)) {
      throw new InvalidGameCreationException(
        "You are already part of an existing game.",
      );
    }
    const waitingRoom: WaitingRoom = {
      gameId: randomUUID(),
      host: {
        playerId: player.id,
        color: createGameDto.color,
      },
    };
    this.players.set(player.id, {
      id: player.id,
      user: player.user,
      gameId: waitingRoom.gameId,
    });
    this.waitingRooms.set(waitingRoom.gameId, waitingRoom);
    this.logger.log(`Created waiting room for game ${waitingRoom.gameId}`);
    return waitingRoom;
  }

  /**
   * Joins the waiting room for an existing game.
   */
  join(
    player: Pick<Player, "id" | "user">,
    joinGameDto: JoinGameDto,
  ): {
    waitingRoom: WaitingRoom;
    host: Player;
  } {
    if (this.players.get(player.id)) {
      throw new InvalidGameJoinException(
        "You are already part of an existing game.",
      );
    }

    const waitingRoom = this.waitingRooms.get(joinGameDto.gameId);
    if (!waitingRoom) {
      throw new GameNotFoundException(joinGameDto.gameId);
    } else if (waitingRoom.opponent) {
      throw new InvalidGameJoinException("The game is already full.");
    }

    let color = waitingRoom.host.color;
    if (color !== "RANDOM") {
      color = waitingRoom.host.color === "WHITE" ? "BLACK" : "WHITE";
    }

    this.players.set(player.id, {
      id: player.id,
      user: player.user,
      gameId: waitingRoom.gameId,
    });
    waitingRoom.opponent = {
      playerId: player.id,
      color,
    };

    const host = this.players.get(waitingRoom.host.playerId);

    if (!host) {
      throw new Error("Host not defined in players for existing game.");
    }

    this.logger.log(`Player ${player.id} joined game ${waitingRoom.gameId}`);

    return {
      waitingRoom,
      host,
    };
  }

  findPlayerById(id: string): Player | null {
    return this.players.get(id) || null;
  }

  removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (player) {
      this.waitingRooms.delete(player.gameId);
      this.games.delete(player.gameId);
      this.logger.log(`Removed game ${player.gameId}`);
      this.players.delete(playerId);
    }
  }
}
