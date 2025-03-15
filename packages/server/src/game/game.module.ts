import { Module } from "@nestjs/common";

import { WebSocketModule } from "../ws";
import { DatabaseModule } from "../db";
import { GameRepository } from "./game.repository";
import { GameHistoryService } from "./services/game-history.service";
import { GameService } from "./services/game.service";
import { GameGateway } from "./game.gateway";

@Module({
  providers: [GameRepository, GameHistoryService, GameService, GameGateway],
  imports: [WebSocketModule, DatabaseModule],
})
export class GameModule {}
