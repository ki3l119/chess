import { ArgumentsHost, ExceptionFilter, Catch } from "@nestjs/common";

import { WebSocketException } from "./ws.exception";
import { WebSocketExtended } from "./types";
import { formatEvent } from "./ws.utils";

@Catch(WebSocketException)
export class WebSocketExceptionFilter implements ExceptionFilter {
  catch(exception: WebSocketException, host: ArgumentsHost) {
    const context = host.switchToWs();
    const socket = context.getClient<WebSocketExtended>();

    socket.send(
      formatEvent({ event: exception.event, data: exception.details }),
    );
  }
}
