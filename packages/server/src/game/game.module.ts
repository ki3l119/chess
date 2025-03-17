import { Module } from "@nestjs/common";

import { WebSocketModule } from "../ws";
import { DatabaseModule } from "../db";
import { GameHistoryRepository } from "./repositories/game-history.repository";
import { GameHistoryService } from "./services/game-history.service";
import { GameService } from "./services/game.service";
import { GameGateway } from "./game.gateway";
import { UserModule } from "../user";
import { GameController } from "./game.controller";

@Module({
  controllers: [GameController],
  providers: [
    GameHistoryRepository,
    GameHistoryService,
    GameService,
    GameGateway,
  ],
  imports: [WebSocketModule, DatabaseModule, UserModule],
})
export class GameModule {}
