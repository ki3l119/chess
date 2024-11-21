import { Response } from "express";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";

import { ProblemDetails } from "chess-shared-types";
import { UserErrorException } from "./common";

@Catch(UserErrorException)
export class UserErrorExceptionFilter implements ExceptionFilter {
  catch(exception: UserErrorException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const problemDetails: ProblemDetails = {
      title: exception.title,
      details: exception.details,
      validationErrors: exception.validationErrors,
    };
    const response = context.getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json(problemDetails);
  }
}
