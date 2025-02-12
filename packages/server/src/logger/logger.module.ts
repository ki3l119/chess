import { Module, Scope, Global, ConsoleLogger } from "@nestjs/common";

@Global()
@Module({
  providers: [
    {
      provide: ConsoleLogger,
      useClass: ConsoleLogger,
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [ConsoleLogger],
})
export class LoggerModule {}
