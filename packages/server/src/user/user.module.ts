import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "../db";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [
    {
      provide: UserService.PASSWORD_SALT_ROUNDS_DEPENDENCY_TOKEN,
      useValue: 10,
    },
    UserRepository,
    UserService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
