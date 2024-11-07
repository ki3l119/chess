import type { Request, Response } from "express";
import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(LoggerMiddleware.name);
  }

  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    const startTime = Date.now();
    res.on("finish", () => {
      const elapsedTime = Date.now() - startTime;
      const message = `${req.method} ${req.path} - ${res.statusCode} response (${elapsedTime.toFixed(4)} ms)`;
      if (res.statusCode >= 200 && res.statusCode <= 399) {
        this.logger.log(message);
      } else {
        this.logger.error(message);
      }
    });

    next();
  }
}
