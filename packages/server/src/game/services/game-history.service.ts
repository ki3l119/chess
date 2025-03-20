import { Injectable } from "@nestjs/common";
import {
  GameHistoryRepository,
  NewGame,
  Game,
} from "../repositories/game-history.repository";
import {
  GameHistoryDto,
  GameHistoryEntryDto,
  GameHistoryStatsDto,
} from "chess-shared-types";
import { PageBasedPaginationInput } from "../../common";

export type FindByUserOptions = {
  pagination?: PageBasedPaginationInput;
};

@Injectable()
export class GameHistoryService {
  constructor(private readonly gameHistoryRepository: GameHistoryRepository) {}

  private static gameToEntryDto(game: Game): GameHistoryEntryDto {
    const { whitePlayer, blackPlayer, startTime, endTime, ...gameInfo } = game;
    return {
      ...gameInfo,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      whitePlayer: whitePlayer && {
        id: whitePlayer.id,
        name: whitePlayer.username,
      },
      blackPlayer: blackPlayer && {
        id: blackPlayer.id,
        name: blackPlayer.username,
      },
    };
  }

  async create(newGame: NewGame): Promise<GameHistoryEntryDto> {
    const game = await this.gameHistoryRepository.insert(newGame);
    return GameHistoryService.gameToEntryDto(game);
  }

  async findByUserId(
    userId: string,
    options: FindByUserOptions = {},
  ): Promise<GameHistoryDto> {
    if (!options.pagination) {
      options.pagination = {
        page: 1,
        pageSize: 50,
      };
    }
    const [games, totalGameCount] = await Promise.all([
      this.gameHistoryRepository.findByUserId(userId, options),
      this.gameHistoryRepository.getUserGameCount(userId),
    ]);
    return {
      games: games.map((game) => GameHistoryService.gameToEntryDto(game)),
      pagination: {
        currentPage: options.pagination.page,
        pageSize: options.pagination.pageSize,
        totalPages: Math.ceil(totalGameCount / options.pagination.pageSize),
      },
    };
  }

  async getUserStats(userId: string): Promise<GameHistoryStatsDto> {
    return this.gameHistoryRepository.getUserStats(userId);
  }
}
