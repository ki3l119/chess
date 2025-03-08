import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { WebSocketAdapter } from "./ws";

import { Config } from "./config";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const config = app.get(ConfigService<Config>);
  const port = config.getOrThrow("port", { infer: true });
  const corsOrigin = config.getOrThrow("corsOrigin", { infer: true });
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.use(cookieParser());
  app.useWebSocketAdapter(new WebSocketAdapter(app));
  app.enableShutdownHooks();
  await app.listen(port);
}

main();
