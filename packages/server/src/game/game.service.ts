import { randomUUID } from "crypto";
import { Injectable, Logger } from "@nestjs/common";

import {
  CreateGameDto,
  GameInfoDto,
  JoinGameDto,
  MoveDto,
  MoveSuccessDto,
  PieceDto,
  StartGameDto,
} from "chess-shared-types";
import { Chess, Board, Move, InvalidMoveException } from "chess-game";
import {
  InvalidGameCreationException,
  InvalidGameJoinException,
  GameNotFoundException,
  InvalidGameMoveException,
  InvalidStartException,
} from "./game.exception";
import { Game, Player } from "./game";
import { BoardCoordinate } from "chess-game/dist/board";

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
   * @throws {InvalidGameCreationException}
   */
  create(
    newPlayer: { id: string; name?: string },
    createGameDto: CreateGameDto,
  ): GameInfoDto {
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
    return {
      id: game.id,
      host: game.getHost(),
      player: game.getPlayer(),
      isColorRandom: game.isRandomColorChoice,
    };
  }

  /**
   * Joins the waiting room for an existing game.
   *
   * @throws {InvalidGameJoinException | GameNotFoundException}
   */
  join(
    newPlayer: { id: string; name?: string },
    joinGameDto: JoinGameDto,
  ): Required<GameInfoDto> {
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
      id: game.id,
      host: game.getHost(),
      player: player,
      isColorRandom: game.isRandomColorChoice,
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
    return this.games.delete(gameId);
  }

  findPlayerGame(playerId: string): string | null {
    return this.playerGameMapping.get(playerId) || null;
  }

  private static boardToPieceCentricRepresentation(board: Board) {
    const pieces: PieceDto[] = [];

    for (const { piece, coordinate } of board.pieces()) {
      pieces.push({
        piece: piece.getFENString(),
        coordinate: {
          rank: coordinate.rank,
          file: coordinate.file,
        },
      });
    }

    return pieces;
  }

  private static mapToLegalMoveDtos(legalMoves: Move[]): MoveDto[] {
    return legalMoves.map((legalMove) => ({
      from: {
        rank: legalMove.from.rank,
        file: legalMove.from.file,
      },
      to: {
        rank: legalMove.to.rank,
        file: legalMove.to.file,
      },
    }));
  }

  /**
   * Initializes the game with the specified id.
   *
   * @returns The placement of each piece in the starting board.
   * @throws {InvalidStartException}
   */
  start(gameId: string, playerId: string): StartGameDto {
    const game = this.games.get(gameId);

    if (!game) {
      throw new GameNotFoundException(gameId);
    }

    if (game.getHost().id !== playerId) {
      throw new InvalidStartException("Only the host can start a game");
    }

    game.start();

    const chess = game.getChessObject();

    return {
      pieces: GameService.boardToPieceCentricRepresentation(chess.getBoard()),
      legalMoves: GameService.mapToLegalMoveDtos(chess.getLegalMoves()),
    };
  }

  move(gameId: string, moveDto: MoveDto): MoveSuccessDto {
    try {
      const game = this.games.get(gameId);

      if (!game) {
        throw new GameNotFoundException(gameId);
      }

      const chess = game.getChessObject();

      chess.move({
        from: new BoardCoordinate(moveDto.from.rank, moveDto.from.file),
        to: new BoardCoordinate(moveDto.to.rank, moveDto.to.file),
      });

      return {
        newPosition: GameService.boardToPieceCentricRepresentation(
          chess.getBoard(),
        ),
        legalMoves: GameService.mapToLegalMoveDtos(chess.getLegalMoves()),
      };
    } catch (e) {
      if (e instanceof InvalidMoveException) {
        throw new InvalidGameMoveException(moveDto);
      }
      throw e;
    }
  }
}
