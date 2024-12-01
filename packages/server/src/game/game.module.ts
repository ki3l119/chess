import { Module } from "@nestjs/common";

import { WebSocketModule } from "../ws";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";

@Module({
  providers: [GameService, GameGateway],
  imports: [WebSocketModule],
})
export class GameModule {}
