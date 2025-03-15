import { randomUUID } from "crypto";
import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";

import {
  CreateGameDto,
  GameInfoDto,
  GameResultDto,
  JoinGameDto,
  MoveDto,
  NewMoveSuccessDto,
  PieceDto,
  PlayerDto,
  StartGameDto,
} from "chess-shared-types";
import {
  Board,
  Move,
  InvalidMoveException,
  PieceColor,
  MoveOptions,
  Chess,
  BoardCoordinate,
} from "chess-game";
import {
  InvalidGameCreationException,
  InvalidGameJoinException,
  GameNotFoundException,
  InvalidGameMoveException,
  InvalidStartException,
  InvalidGameStateException,
} from "../game.exception";
import { Game, NewPlayer, Player } from "../game";
import { EventEmitter } from "stream";
import { GameHistoryService } from "./game-history.service";

type GameServiceEventMap = {
  timeout: [gameInfo: GameInfoDto, gameResult: GameResultDto];
};

@Injectable()
export class GameService extends EventEmitter<GameServiceEventMap> {
  // Maps each player id to their game id
  private readonly playerGameMapping: Map<string, string>;

  // For registered players. Maps each user id to their game id
  private readonly userGameMapping: Map<string, string>;

  private gameTimeoutListener: (game: Game, player: Player) => void;

  private readonly games: Map<string, Game>;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly gameHistoryService: GameHistoryService,
  ) {
    super();
    this.games = new Map();
    this.playerGameMapping = new Map();
    this.userGameMapping = new Map();
    this.logger.setContext(GameService.name);
    this.gameTimeoutListener = (game, player) => {
      const gameResult: GameResultDto = {
        winner: player.color === PieceColor.BLACK ? "WHITE" : "BLACK",
        reason: "TIMEOUT",
      };
      this.end(game, gameResult);
      this.emit("timeout", GameService.toGameInfoDto(game), gameResult);
    };
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

  private static toGameInfoDto(game: Game): GameInfoDto {
    const player = game.getPlayer();
    return {
      id: game.id,
      host: GameService.toPlayerDto(game.getHost()),
      player: player ? GameService.toPlayerDto(player) : undefined,
      isColorRandom: game.isRandomColorChoice,
      playerTimerDuration: game.playerTimerDuration,
    };
  }

  private static toPlayerDto(player: Player): PlayerDto {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
    };
  }

  private logGameCount() {
    this.logger.log(`Number of active games: ${this.games.size}`);
  }

  /**
   * Creates a new game with the player as the host.
   *
   * @throws {InvalidGameCreationException}
   */
  create(
    newPlayer: NewPlayer,
    createGameDto: Omit<CreateGameDto, "playerTimerDuration"> & {
      playerTimerDuration?: number;
    },
  ): GameInfoDto {
    if (this.isPlayerPlaying(newPlayer)) {
      throw new InvalidGameCreationException(
        "You are already part of an existing game.",
      );
    }

    const game = new Game(
      randomUUID(),
      newPlayer,
      createGameDto.color,
      createGameDto.playerTimerDuration,
    );
    game.once("timeout", this.gameTimeoutListener);
    this.games.set(game.id, game);
    this.playerGameMapping.set(newPlayer.id, game.id);
    if (newPlayer.userId) {
      this.userGameMapping.set(newPlayer.userId, game.id);
    }
    this.logger.log(`Created game ${game.id}`);
    this.logGameCount();
    return GameService.toGameInfoDto(game);
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

    return GameService.toGameInfoDto(game) as Required<GameInfoDto>;
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
      const opponent = isHost ? player : host;
      if (hasGameStarted && opponent) {
        gameResult = {
          winner: opponent.color,
          reason: "ABANDONED",
        };
        this.end(game, gameResult);
      } else {
        this.end(game);
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

  /**
   * Removes the game from the currently active games.
   *
   * If game result is defined, the game is persisted into the database.
   */
  private end(game: Game, gameResult?: GameResultDto): boolean {
    const players = [game.getHost(), game.getPlayer()];
    for (const player of players) {
      if (player) {
        this.playerLeave(player);
      }
    }
    game.removeListener("timeout", this.gameTimeoutListener);
    game.stop();
    this.logger.log(`Deleted game ${game.id}.`);
    const result = this.games.delete(game.id);
    const host = game.getHost();
    const player = game.getPlayer();
    if (
      gameResult &&
      (host.userId != undefined || player?.userId != undefined)
    ) {
      this.logger.log(`Saving game ${game.id} into database.`);
      this.gameHistoryService.create({
        id: game.id,
        startTime: game.getStartTime(),
        endTime: new Date(),
        winner: gameResult.winner,
        reason: gameResult.reason,
        whitePlayerId:
          host.color === PieceColor.WHITE ? host.userId : player?.userId,
        blackPlayerId:
          host.color === PieceColor.BLACK ? host.userId : player?.userId,
      });
    }
    this.logGameCount();
    return result;
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

    const board = game.getBoard();
    const legalMoves = game.getLegalMoves();

    return {
      pieces: GameService.boardToPieceCentricRepresentation(board),
      legalMoves: GameService.mapToLegalMoveDtos(legalMoves),
    };
  }

  move(
    gameId: string,
    moveDto: MoveDto,
    playerId: string,
    options: MoveOptions = {},
  ): NewMoveSuccessDto {
    try {
      const game = this.games.get(gameId);

      if (!game) {
        throw new GameNotFoundException(gameId);
      }

      let player = game.getActivePlayer();

      if (player.id !== playerId) {
        throw new InvalidGameMoveException(moveDto, playerId);
      }

      const moveResult = game.move(
        {
          from: new BoardCoordinate(moveDto.from.rank, moveDto.from.file),
          to: new BoardCoordinate(moveDto.to.rank, moveDto.to.file),
        },
        options,
      );

      const gameResult = game.getResult();

      if (gameResult) {
        this.end(game, gameResult);
      }

      return {
        newPosition: GameService.boardToPieceCentricRepresentation(
          moveResult.board,
        ),
        legalMoves: GameService.mapToLegalMoveDtos(game.getLegalMoves()),
        gameResult: game.getResult() || undefined,
        remainingTime: moveResult.player.remainingTime,
      };
    } catch (e) {
      if (e instanceof InvalidMoveException) {
        throw new InvalidGameMoveException(moveDto, playerId);
      }
      throw e;
    }
  }

  findById(id: string) {
    const game = this.games.get(id);
    return game ? GameService.toGameInfoDto(game) : null;
  }

  /**
   * Haves the player resign from their game.
   *
   * @throws {GameNotFoundException} If the player does not belong to the game.
   */
  resign(gameId: string, playerId: string): GameResultDto {
    const game = this.games.get(gameId);

    if (!game || this.playerGameMapping.get(playerId) !== game.id) {
      throw new GameNotFoundException(gameId);
    }

    if (!game.hasStarted()) {
      throw new InvalidGameStateException("The game has not yet started.");
    }

    const resigningPlayer = game.findPlayerById(playerId);

    if (!resigningPlayer) {
      throw new Error("Player is not part of the game.");
    }

    const gameResult: GameResultDto = {
      winner: Chess.getOpposingColor(resigningPlayer.color),
      reason: "RESIGNED",
    };

    this.end(game, gameResult);

    return gameResult;
  }
}
