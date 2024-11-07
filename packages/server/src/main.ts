import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { Config } from "./config";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const config = app.get(ConfigService<Config>);
  const port = config.getOrThrow("PORT", { infer: true });
  await app.listen(port);
}

main();
