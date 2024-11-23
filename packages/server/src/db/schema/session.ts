import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface SessionsTable {
  id: Generated<string>;
  userId: string;
  createdAt: Generated<Date>;
  expiresAt: Date;
}

export type NewSession = Insertable<SessionsTable>;
export type Session = Selectable<SessionsTable>;
export type UpdateSession = Updateable<SessionsTable>;
