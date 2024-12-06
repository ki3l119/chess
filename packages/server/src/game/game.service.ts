import { Injectable, Logger } from "@nestjs/common";

import { CreateGameDto } from "chess-shared-types";
import { Game, PieceColor } from "./models/game";

@Injectable()
export class GameService {
  private readonly games: Map<string, Game>;
  private readonly logger: Logger;

  constructor() {
    this.games = new Map();
    this.logger = new Logger(GameService.name);
  }

  create(createGameDto: CreateGameDto): { gameId: string; color: PieceColor } {
    const game = new Game();
    let color = PieceColor.WHITE;

    if (createGameDto.color === "RANDOM") {
      color = [PieceColor.WHITE, PieceColor.BLACK][
        Math.floor(Math.random() * 2)
      ];
    } else {
      color = PieceColor[createGameDto.color];
    }

    this.games.set(game.id, game);
    this.logger.log(`Created new game ${game.id}.`);
    return {
      color,
      gameId: game.id,
    };
  }

  delete(gameId: string) {
    const result = this.games.delete(gameId);
    if (result) {
      this.logger.log(`Deleted game ${gameId}`);
    }
  }

  checkExists(id: string): boolean {
    const game = this.games.get(id);
    return game !== undefined;
  }
}
