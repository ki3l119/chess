import { Module } from "@nestjs/common";

import { UserModule } from "../user";
import { RoomService } from "./room.service";
import { WebSocketExceptionFilter } from "./ws-exception.filter";

@Module({
  providers: [RoomService, WebSocketExceptionFilter],
  imports: [UserModule],
  exports: [RoomService, WebSocketExceptionFilter],
})
export class WebSocketModule {}
