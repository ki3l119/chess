import { randomUUID } from "crypto";
import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";

import {
  CreateGameDto,
  GameInfoDto,
  GameResultDto,
  JoinGameDto,
  MoveDto,
  MoveSuccessDto,
  PieceDto,
  StartGameDto,
} from "chess-shared-types";
import { Board, Move, InvalidMoveException, GameResult } from "chess-game";
import {
  InvalidGameCreationException,
  InvalidGameJoinException,
  GameNotFoundException,
  InvalidGameMoveException,
  InvalidStartException,
} from "./game.exception";
import { Game, NewPlayer, Player } from "./game";
import { BoardCoordinate } from "chess-game/dist/board";

@Injectable()
export class GameService {
  // Maps each player id to their game id
  private readonly playerGameMapping: Map<string, string>;

  // For registered players. Maps each user id to their game id
  private readonly userGameMapping: Map<string, string>;

  private readonly games: Map<string, Game>;

  constructor(private readonly logger: ConsoleLogger) {
    this.games = new Map();
    this.playerGameMapping = new Map();
    this.userGameMapping = new Map();
    this.logger.setContext(GameService.name);
  }

  private isPlayerPlaying(player: NewPlayer) {
    return (
      this.playerGameMapping.get(player.id) ||
      (player.userId && this.userGameMapping.get(player.userId))
    );
  }

  private playerLeave(player: Player) {
    this.playerGameMapping.delete(player.id);
    if (player.userId) {
      this.userGameMapping.delete(player.userId);
    }
    this.logger.log(`Player ${player.id} has left their game.`);
  }

  /**
   * Creates a new game with the player as the host.
   *
   * @throws {InvalidGameCreationException}
   */
  create(newPlayer: NewPlayer, createGameDto: CreateGameDto): GameInfoDto {
    if (this.isPlayerPlaying(newPlayer)) {
      throw new InvalidGameCreationException(
        "You are already part of an existing game.",
      );
    }

    const game = new Game(randomUUID(), newPlayer, createGameDto.color);
    this.games.set(game.id, game);
    this.playerGameMapping.set(newPlayer.id, game.id);
    if (newPlayer.userId) {
      this.userGameMapping.set(newPlayer.userId, game.id);
    }
    this.logger.log(`Created game ${game.id}`);
    return {
      id: game.id,
      host: game.getHost(),
      player: game.getPlayer() || undefined,
      isColorRandom: game.isRandomColorChoice,
    };
  }

  /**
   * Joins the waiting room for an existing game.
   *
   * @throws {InvalidGameJoinException | GameNotFoundException}
   */
  join(newPlayer: NewPlayer, joinGameDto: JoinGameDto): Required<GameInfoDto> {
    if (this.isPlayerPlaying(newPlayer)) {
      throw new InvalidGameJoinException(
        "You are already part of an existing game.",
      );
    }

    const game = this.games.get(joinGameDto.gameId);
    if (!game) {
      throw new GameNotFoundException(joinGameDto.gameId);
    }

    const isGameFull = game.getPlayer() !== null;

    if (isGameFull) {
      throw new InvalidGameJoinException("The game is already full.");
    }

    const player = game.setPlayer(newPlayer);

    this.playerGameMapping.set(player.id, game.id);
    if (newPlayer.userId) {
      this.userGameMapping.set(newPlayer.userId, game.id);
    }
    this.logger.log(`Player ${player.id} joined game ${game.id}`);

    return {
      id: game.id,
      host: game.getHost(),
      player: player,
      isColorRandom: game.isRandomColorChoice,
    };
  }

  leave(
    gameId: string,
    playerId: string,
  ): { isHost: boolean; gameResult?: GameResultDto } {
    const game = this.games.get(gameId);

    if (!game) {
      throw new GameNotFoundException(gameId);
    }

    const host = game.getHost();
    const player = game.getPlayer();

    if (host.id !== playerId && player?.id !== playerId) {
      throw new GameNotFoundException(gameId);
    }

    const isHost = host.id === playerId;
    const hasGameStarted = game.hasStarted();
    let gameResult: GameResultDto | undefined;

    if (hasGameStarted || isHost) {
      this.delete(game.id);
      const opponent = isHost ? player : host;
      if (hasGameStarted && opponent) {
        gameResult = {
          winner: opponent.color,
          reason: "ABANDONED",
        };
      }
    } else if (player) {
      this.playerLeave(player);
      game.setPlayer(null);
    }

    return {
      isHost,
      gameResult: gameResult,
    };
  }

  delete(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    const players = [game.getHost(), game.getPlayer()];
    for (const player of players) {
      if (player) {
        this.playerLeave(player);
      }
    }
    this.logger.log(`Deleted game ${gameId}.`);
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

  move(gameId: string, moveDto: MoveDto, playerId: string): MoveSuccessDto {
    try {
      const game = this.games.get(gameId);

      if (!game) {
        throw new GameNotFoundException(gameId);
      }

      const player = game.getActivePlayer();

      if (player.id !== playerId) {
        throw new InvalidGameMoveException(moveDto, playerId);
      }

      const chess = game.getChessObject();

      chess.move({
        from: new BoardCoordinate(moveDto.from.rank, moveDto.from.file),
        to: new BoardCoordinate(moveDto.to.rank, moveDto.to.file),
      });

      const result = chess.getResult();

      return {
        newPosition: GameService.boardToPieceCentricRepresentation(
          chess.getBoard(),
        ),
        legalMoves: GameService.mapToLegalMoveDtos(chess.getLegalMoves()),
        gameResult: result || undefined,
      };
    } catch (e) {
      if (e instanceof InvalidMoveException) {
        throw new InvalidGameMoveException(moveDto, playerId);
      }
      throw e;
    }
  }

  findGameById(id: string) {
    return this.games.get(id) || null;
  }
}
