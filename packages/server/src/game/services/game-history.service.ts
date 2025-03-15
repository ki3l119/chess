import { Injectable } from "@nestjs/common";
import { GameRepository, NewGame, Game } from "../game.repository";
import { GameHistoryEntryDto as GameHistoryEntryDto } from "chess-shared-types";

@Injectable()
export class GameHistoryService {
  constructor(private readonly gameRepository: GameRepository) {}

  private static gameToEntryDto(game: Game): GameHistoryEntryDto {
    const { whitePlayer, blackPlayer, ...gameInfo } = game;
    return {
      ...gameInfo,
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
    const game = await this.gameRepository.insert(newGame);
    return GameHistoryService.gameToEntryDto(game);
  }
}
