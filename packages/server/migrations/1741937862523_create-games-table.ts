import { type Kysely, sql } from "kysely";

const pieceColorEnumName = "game_piece_color";
const gameEndReasonEnumName = "game_end_reason";
const gamesTableName = "games";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType(pieceColorEnumName)
    .asEnum(["WHITE", "BLACK"])
    .execute();

  await db.schema
    .createType(gameEndReasonEnumName)
    .asEnum([
      "CHECKMATE",
      "STALEMATE",
      "FIFTY_MOVE_RULE",
      "ABANDONED",
      "TIMEOUT",
      "RESIGNED",
    ])
    .execute();

  await db.schema
    .createTable(gamesTableName)
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("white_player_id", "uuid")
    .addColumn("black_player_id", "uuid")
    .addColumn("start_time", "timestamptz(3)", (col) => col.notNull())
    .addColumn("end_time", "timestamptz(3)", (col) => col.notNull())
    .addColumn("winner", sql`game_piece_color`)
    .addColumn("reason", sql`game_end_reason`, (col) => col.notNull())
    .addForeignKeyConstraint(
      "games_white_player_id_fkey",
      ["white_player_id"],
      "users",
      ["id"],
    )
    .addForeignKeyConstraint(
      "games_black_player_id_fkey",
      ["black_player_id"],
      "users",
      ["id"],
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(gamesTableName).execute();
  await db.schema.dropType(pieceColorEnumName).execute();
  await db.schema.dropType(gameEndReasonEnumName).execute();
}
