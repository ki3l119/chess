import { Module } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { Pool } from "pg";
import { CamelCasePlugin, PostgresDialect } from "kysely";

import { Config } from "../config";
import { Database } from "./database";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Database,
      useFactory: (configService: ConfigService<Config>) => {
        const dbConfig = configService.getOrThrow("db", { infer: true });
        const pool = new Pool(dbConfig);
        return new Database({
          dialect: new PostgresDialect({
            pool,
          }),
          plugins: [new CamelCasePlugin()],
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [Database],
})
export class DatabaseModule {}
