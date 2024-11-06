import { Kysely, sql } from "kysely";

const usersTable = "users";
const uniqueUsernameIndexName = "users_username_idx";
const uniqueEmailIndexName = "users_email_idx";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex(uniqueUsernameIndexName)
    .unique()
    .on(usersTable)
    .expression(sql`lower(username)`)
    .execute();

  await db.schema
    .createIndex(uniqueEmailIndexName)
    .unique()
    .on(usersTable)
    .expression(sql`lower(email)`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex(uniqueUsernameIndexName).execute();
  await db.schema.dropIndex(uniqueEmailIndexName).execute();
}
