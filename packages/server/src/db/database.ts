import { Kysely } from "kysely";
import { Injectable } from "@nestjs/common";

import { UsersTable } from "./schema/user";

interface Schema {
  users: UsersTable;
}

@Injectable()
export class Database extends Kysely<Schema> {}
