import type { Kysely } from "kysely";

const uniqueUsernameConstraintName = "unique_users_username";
const uniqueEmailConstraintName = "unique_users_email";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("users")
    .addUniqueConstraint(uniqueUsernameConstraintName, ["username"])
    .execute();
  await db.schema
    .alterTable("users")
    .addUniqueConstraint(uniqueEmailConstraintName, ["email"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("users")
    .dropConstraint(uniqueUsernameConstraintName)
    .execute();
  await db.schema
    .alterTable("users")
    .dropConstraint(uniqueEmailConstraintName)
    .execute();
}
