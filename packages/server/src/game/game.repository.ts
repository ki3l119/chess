import { Injectable } from "@nestjs/common";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { Database, Game as GameDb, NewGame, User } from "../db";

export type Game = Omit<GameDb, "whitePlayerId" | "blackPlayerId"> & {
  whitePlayer: User | null;
  blackPlayer: User | null;
};

export { NewGame, User };

@Injectable()
/**
 * Repository for storing finished games
 */
export class GameRepository {
  constructor(private readonly db: Database) {}

  async insert(
    newGame: NewGame,
  ): Promise<Game & { whitePlayer: User | null; blackPlayer: User | null }> {
    const query = this.db
      .with("newGame", (db) =>
        db.insertInto("games").values(newGame).returningAll(),
      )
      .selectFrom("newGame")
      .select((eb) => [
        "newGame.id",
        "newGame.startTime",
        "newGame.endTime",
        "newGame.winner",
        "newGame.reason",
        jsonObjectFrom(
          eb
            .selectFrom("users")
            .selectAll("users")
            .innerJoin("newGame", "newGame.whitePlayerId", "users.id")
            .limit(1),
        ).as("whitePlayer"),
        jsonObjectFrom(
          eb
            .selectFrom("users")
            .selectAll("users")
            .innerJoin("newGame", "newGame.blackPlayerId", "users.id")
            .limit(1),
        ).as("blackPlayer"),
      ]);
    const game = await query.executeTakeFirstOrThrow();
    return game;
  }
}
