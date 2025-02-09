import type { Request, Response } from "express";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
} from "@nestjs/common";

import { UserDto } from "chess-shared-types";
import { COOKIE_SESSION_KEY } from "./constants";
import { UserService } from "./user.service";

type RequestWithUser = Request & {
  user?: UserDto;
  sessionId?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithUser>();
    const response = httpContext.getResponse<Response>();
    const sessionId = request.cookies[COOKIE_SESSION_KEY];
    const user = await this.userService.validateSession(sessionId);
    if (user) {
      request.user = user;
      request.sessionId = sessionId;
      return true;
    }
    response.clearCookie(COOKIE_SESSION_KEY);
    return false;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error("Current user is not defined.");
    }
    return request.user;
  },
);

export const SessionId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.sessionId) {
      throw new Error("Request is not associated with a session.");
    }
    return request.sessionId;
  },
);
