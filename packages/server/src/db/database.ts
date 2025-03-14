import { Kysely } from "kysely";
import { Injectable } from "@nestjs/common";

import { UsersTable } from "./schema/user";
import { SessionsTable } from "./schema/session";
import { GamesTable } from "./schema/game";

interface Schema {
  users: UsersTable;
  sessions: SessionsTable;
  games: GamesTable;
}

@Injectable()
export class Database extends Kysely<Schema> {}
