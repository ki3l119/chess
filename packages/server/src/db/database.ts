import { Kysely } from "kysely";
import { Injectable } from "@nestjs/common";

import { UsersTable } from "./schema/user";
import { SessionsTable } from "./schema/session";

interface Schema {
  users: UsersTable;
  sessions: SessionsTable;
}

@Injectable()
export class Database extends Kysely<Schema> {}
