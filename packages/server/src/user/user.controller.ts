import { Response } from "express";
import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";

import {
  CreateUserDto,
  LoginDto,
  ProblemDetails,
  UserDto,
} from "chess-shared-types";
import { JoiValidationPipe } from "../common";
import { createUserDtoSchema, loginDtoSchema } from "./user.validator";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  private static COOKIE_SESSION_KEY = "session";

  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createUserDtoSchema))
  post(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }

  @Post("auth")
  async postAuth(
    @Body(new JoiValidationPipe(loginDtoSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const result = await this.userService.login(loginDto);
    if (result == null) {
      const problemDetails: ProblemDetails = {
        title: "Invalid login credentials.",
        details: "Your email or password was not correct.",
      };
      throw new UnauthorizedException(problemDetails);
    }
    response.cookie(UserController.COOKIE_SESSION_KEY, result.id, {
      httpOnly: true,
      expires: result.expiresAt,
    });
  }
}
