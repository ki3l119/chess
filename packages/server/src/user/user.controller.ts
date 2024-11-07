import { Body, Controller, Post, UsePipes } from "@nestjs/common";

import { CreateUserDto, UserDto } from "chess-shared-types";
import { JoiValidationPipe } from "../common";
import { createUserDtoSchema } from "./user.validator";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createUserDtoSchema))
  post(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }
}
