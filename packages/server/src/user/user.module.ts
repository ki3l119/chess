import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "../db";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [UserRepository, UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
