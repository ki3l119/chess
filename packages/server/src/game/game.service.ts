import { randomUUID } from "crypto";
import { Injectable, Logger } from "@nestjs/common";

import {
  CreateGameDto,
  JoinGameDto,
  PieceColorChoice,
} from "chess-shared-types";
import {
  InvalidGameCreationException,
  InvalidGameJoinException,
  GameNotFoundException,
} from "./game.exception";
import { Game, Player } from "./game";

@Injectable()
export class GameService {
  // Maps each player id to their game id
  private readonly playerGameMapping: Map<string, string>;

  private readonly games: Map<string, Game>;
  private readonly logger: Logger;

  constructor() {
    this.games = new Map();
    this.playerGameMapping = new Map();
    this.logger = new Logger();
  }

  /**
   * Creates a new game with the player as the host.
   *
   * @returns The id of the newly created game.
   * @throws {InvalidGameCreationException}
   */
  create(
    newPlayer: { id: string; name?: string },
    createGameDto: CreateGameDto,
  ): string {
    if (this.playerGameMapping.get(newPlayer.id)) {
      throw new InvalidGameCreationException(
        "You are already part of an existing game.",
      );
    }

    const game = new Game(randomUUID(), {
      id: newPlayer.id,
      name: newPlayer.name || "Guest",
      color: createGameDto.color,
    });
    this.games.set(game.id, game);
    this.playerGameMapping.set(newPlayer.id, game.id);
    this.logger.log(`Created game ${game.id}`);
    return game.id;
  }

  /**
   * Joins the waiting room for an existing game.
   *
   * @throws {InvalidGameJoinException | GameNotFoundException}
   */
  join(
    newPlayer: { id: string; name?: string },
    joinGameDto: JoinGameDto,
  ): { gameId: string; host: Player; color: PieceColorChoice; player: Player } {
    if (this.playerGameMapping.get(newPlayer.id)) {
      throw new InvalidGameJoinException(
        "You are already part of an existing game.",
      );
    }

    const game = this.games.get(joinGameDto.gameId);
    if (!game) {
      throw new GameNotFoundException(joinGameDto.gameId);
    }

    const isGameFull = game.getPlayer() !== undefined;

    if (isGameFull) {
      throw new InvalidGameJoinException("The game is already full.");
    }

    const player = game.setPlayer({
      id: newPlayer.id,
      name: newPlayer.name || "Guest",
    });

    this.playerGameMapping.set(player.id, game.id);
    this.logger.log(`Player ${player.id} joined game ${game.id}`);

    return {
      gameId: game.id,
      host: game.getHost(),
      color: game.isRandomColorChoice ? "RANDOM" : player.color,
      player: player,
    };
  }

  delete(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    this.playerGameMapping.delete(game.getHost().id);
    const player = game.getPlayer();
    if (player) {
      this.playerGameMapping.delete(player.id);
    }
    return this.playerGameMapping.delete(gameId);
  }

  findPlayerGame(playerId: string): string | null {
    return this.playerGameMapping.get(playerId) || null;
  }
}
