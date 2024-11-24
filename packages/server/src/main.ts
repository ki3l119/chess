import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { Config } from "./config";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const config = app.get(ConfigService<Config>);
  const port = config.getOrThrow("PORT", { infer: true });
  const clientDomain = config.getOrThrow("CLIENT_DOMAIN", { infer: true });
  app.enableCors({
    origin: clientDomain,
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(port);
}

main();
