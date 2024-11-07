import { Response } from "express";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";

import { UserErrorException } from "./common";

@Catch(UserErrorException)
export class UserErrorExceptionFilter implements ExceptionFilter {
  catch(exception: UserErrorException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      message: exception.message,
    });
  }
}
