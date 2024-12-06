import { randomUUID } from "crypto";
import { ServerOptions, VerifyClientCallbackAsync, WebSocketServer } from "ws";
import { INestApplicationContext } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";

import { UserService, COOKIE_SESSION_KEY } from "../user";
import type { IncomingMessageWithUser, WebSocketExtended } from "./types";

export class WebSocketAdapter extends WsAdapter {
  private readonly userService: UserService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.userService = app.get(UserService);
  }

  create(port: number, options?: ServerOptions) {
    /**
     * Populates request object with user id on successful authentication.
     */
    const verifyClient: VerifyClientCallbackAsync<IncomingMessageWithUser> = (
      info,
      callback,
    ) => {
      const requestInfo = `${info.req.method} ${info.req.url}`;
      const cookieHeader = info.req.headers.cookie;
      const cookies = cookieHeader ? cookieHeader.split("; ") : [];
      let sessionId: string | undefined;
      for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key == COOKIE_SESSION_KEY) {
          sessionId = value;
          break;
        }
      }

      if (!sessionId) {
        this.logger.log(
          `${requestInfo} - Successfully upgraded to websocket for guest`,
        );
        callback(true);
        return;
      }

      this.userService.validateSession(sessionId).then(
        (userDto) => {
          if (userDto != null) {
            info.req.user = userDto;
            this.logger.log(
              `${requestInfo} - Successfully upgraded to websocket for logged-in user`,
            );
            callback(true);
          } else {
            this.logger.error(
              `${requestInfo} - Failure to upgrade due to invalid session`,
            );
            callback(false);
          }
        },
        (e) => {
          this.logger.error(
            `${requestInfo} - Failure to upgrade due to error: ${e}`,
          );
          callback(false);
        },
      );
    };

    if (!options) {
      options = {};
    }

    options.verifyClient = verifyClient;
    const server: WebSocketServer = super.create(port, options);

    server.on(
      "connection",
      (socket: WebSocketExtended, request: IncomingMessageWithUser) => {
        socket.id = randomUUID();
        socket.user = request.user;
        this.logger.log(`New client connected: ${socket.id}`);
      },
    );

    return server;
  }

  bindClientDisconnect(socket: WebSocketExtended, callback: Function): void {
    socket.on("close", () => {
      this.logger.log(`Client disconnected: ${socket.id}`);
    });
    super.bindClientDisconnect(socket, callback);
  }
}
