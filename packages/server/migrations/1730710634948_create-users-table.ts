import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("username", "varchar(50)", (col) => col.notNull())
    .addColumn("email", "varchar(320)", (col) => col.notNull())
    .addColumn("password", "char(60)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz(3)", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
