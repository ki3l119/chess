import { Injectable } from "@nestjs/common";
import { sql } from "kysely";

import { PageBasedPaginationInput } from "../../common";
import { Database, Game as GameDb, NewGame, User } from "../../db";

export type Game = Omit<GameDb, "whitePlayerId" | "blackPlayerId"> & {
  whitePlayer: User | null;
  blackPlayer: User | null;
};

export { NewGame, User };

export type FindGamesByUserOptions = {
  pagination?: PageBasedPaginationInput;
};

export type UserGameStats = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
};

@Injectable()
/**
 * Repository for storing finished games
 */
export class GameHistoryRepository {
  constructor(private readonly db: Database) {}

  async insert(newGame: NewGame): Promise<Game> {
    const query = this.db
      .with("newGame", (db) =>
        db.insertInto("games").values(newGame).returningAll(),
      )
      .selectFrom("newGame")
      .leftJoin(
        "users as whitePlayer",
        "newGame.whitePlayerId",
        "whitePlayer.id",
      )
      .leftJoin(
        "users as blackPlayer",
        "newGame.blackPlayerId",
        "blackPlayer.id",
      )
      .selectAll("newGame")
      .select((eb) => [
        sql<User | null>`to_json(${eb.table("whitePlayer")})`.as("whitePlayer"),
        sql<User | null>`to_json(${eb.table("blackPlayer")})`.as("blackPlayer"),
      ]);
    const { blackPlayerId, whitePlayerId, ...game } =
      await query.executeTakeFirstOrThrow();
    return game;
  }

  /**
   * Finds all games the user was part of.
   *
   * Can use page-based pagination to navigate the result.
   */
  async findByUserId(
    userId: string,
    options: FindGamesByUserOptions = {},
  ): Promise<Game[]> {
    let query = this.db
      .selectFrom("games")
      .leftJoin("users as whitePlayer", "games.whitePlayerId", "whitePlayer.id")
      .leftJoin("users as blackPlayer", "games.blackPlayerId", "blackPlayer.id")
      .where((eb) =>
        eb("whitePlayerId", "=", userId).or("blackPlayerId", "=", userId),
      )
      .selectAll("games")
      .select((eb) => [
        sql<User | null>`to_json(${eb.table("whitePlayer")})`.as("whitePlayer"),
        sql<User | null>`to_json(${eb.table("blackPlayer")})`.as("blackPlayer"),
      ])
      .orderBy("games.startTime", "desc")
      .orderBy("games.id");

    if (options.pagination) {
      query = query
        .offset((options.pagination.page - 1) * options.pagination.pageSize)
        .limit(options.pagination.pageSize);
    }
    const games = await query.execute();
    return games.map((game) => {
      const { blackPlayerId, whitePlayerId, ...gameInfo } = game;
      return gameInfo;
    });
  }

  /**
   * The number of games that user is part of.
   */
  async getUserGameCount(userId: string): Promise<number> {
    const query = this.db
      .selectFrom("games")
      .select((eb) => [
        eb.cast<number>(eb.fn.countAll<number>(), "integer").as("count"),
      ])
      .where((eb) =>
        eb("whitePlayerId", "=", userId).or("blackPlayerId", "=", userId),
      );

    const { count } = await query.executeTakeFirstOrThrow();
    return count;
  }

  async getUserStats(userId: string): Promise<UserGameStats> {
    const query = this.db
      .selectFrom("games")
      .select((eb) => [
        eb.cast<number>(eb.fn.countAll(), "integer").as("totalGames"),
        eb
          .cast<number>(
            eb.fn
              .countAll()
              .filterWhere(
                eb.or([
                  eb("whitePlayerId", "=", userId).and("winner", "=", "WHITE"),
                  eb("blackPlayerId", "=", userId).and("winner", "=", "BLACK"),
                ]),
              ),
            "integer",
          )
          .as("wins"),
        eb
          .cast<number>(
            eb.fn.countAll().filterWhere("winner", "is", null),
            "integer",
          )
          .as("draws"),
      ])
      .where((eb) =>
        eb("whitePlayerId", "=", userId).or("blackPlayerId", "=", userId),
      );

    const { wins, totalGames, draws } = await query.executeTakeFirstOrThrow();

    return {
      totalGames,
      wins,
      losses: totalGames - (wins + draws),
      draws,
    };
  }
}
