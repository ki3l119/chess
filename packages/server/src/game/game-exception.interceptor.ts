import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { MESSAGE_METADATA } from "@nestjs/websockets/constants";
import { catchError, Observable, throwError } from "rxjs";
import { GameException } from "./game.exception";
import { WebSocketException } from "../ws";

@Injectable()
/**
 * Converts exception from handlers to WebSocketException errors.
 */
export class GameExceptionInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const event = this.reflector.get(MESSAGE_METADATA, context.getHandler());
    return next.handle().pipe(
      catchError((e) => {
        const eventError = `${event}:error`;
        if (e instanceof GameException) {
          throw new WebSocketException(eventError, e.problemDetails);
        }
        throw new WebSocketException(eventError, {
          title: "Internal server error.",
          details: "Unexpected server error has occured.",
        });
      }),
    );
  }
}
