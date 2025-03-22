import { Response } from "express";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  CreateUserDto,
  LoginDto,
  ProblemDetails,
  UserDto,
} from "chess-shared-types";
import { Config } from "../config";
import { JoiValidationPipe } from "../common";
import { COOKIE_SESSION_KEY } from "./constants";
import { createUserDtoSchema, loginDtoSchema } from "./user.validator";
import { UserService } from "./user.service";
import { AuthGuard, CurrentUser, SessionId } from "./auth.guard";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService<Config>,
  ) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createUserDtoSchema.required()))
  post(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const isRegistrationDisabled = this.configService.getOrThrow(
      "disableRegistration",
      { infer: true },
    );
    if (isRegistrationDisabled) {
      throw new ServiceUnavailableException();
    }
    return this.userService.create(createUserDto);
  }

  @Post("auth")
  async postAuth(
    @Body(new JoiValidationPipe(loginDtoSchema.required())) loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserDto> {
    const result = await this.userService.login(loginDto);
    if (result == null) {
      const problemDetails: ProblemDetails = {
        title: "Invalid login credentials.",
        details: "Your email or password was not correct.",
      };
      throw new UnauthorizedException(problemDetails);
    }
    response.cookie(COOKIE_SESSION_KEY, result.session.id, {
      httpOnly: true,
      expires: new Date(result.session.expiresAt),
    });

    return result.user;
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: UserDto) {
    return user;
  }

  @Delete("auth")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteAuth(
    @SessionId() sessionId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const result = await this.userService.logout(sessionId);
    response.clearCookie(COOKIE_SESSION_KEY);
    if (!result) {
      const problemDetails: ProblemDetails = {
        title: "Session not found.",
        details: "Cannot logout as there is no existing session.",
      };
      throw new BadRequestException(problemDetails);
    }
  }
}
