import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { AuthGuard, CurrentUser } from "../user";

import {
  GameHistoryDto,
  GameHistoryStatsDto,
  GetGameHistoryQueryDto,
  UserDto,
} from "chess-shared-types";
import { GameHistoryService } from "./services/game-history.service";
import { JoiValidationPipe } from "../common";
import { getGameHistoryQuerySchema } from "./game.validator";

@Controller("games")
export class GameController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  @Get("history")
  @UseGuards(AuthGuard)
  getHistory(
    @CurrentUser() user: UserDto,
    @Query(new JoiValidationPipe(getGameHistoryQuerySchema))
    query: GetGameHistoryQueryDto,
  ): Promise<GameHistoryDto> {
    return this.gameHistoryService.findByUserId(user.id, {
      pagination: query,
    });
  }

  @Get("history/stats")
  @UseGuards(AuthGuard)
  getHistoryStats(@CurrentUser() user: UserDto): Promise<GameHistoryStatsDto> {
    return this.gameHistoryService.getUserStats(user.id);
  }
}
