import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import { configValidationSchema } from "./config";
import { UserErrorExceptionFilter } from "./user-error.exception.filter";
import { DatabaseModule } from "./db";
import { UserModule } from "./user";
import { LoggerMiddleware } from "./logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UserErrorExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
