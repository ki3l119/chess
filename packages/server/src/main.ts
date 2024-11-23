import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { Config } from "./config";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const config = app.get(ConfigService<Config>);
  const port = config.getOrThrow("PORT", { infer: true });
  const nodeEnv = config.getOrThrow("NODE_ENV", { infer: true });
  if (nodeEnv == "development") {
    app.enableCors();
  }
  await app.listen(port);
}

main();
