import { Injectable } from "@nestjs/common";
import { DatabaseError } from "pg";

import { User, NewUser, Database, Session, NewSession } from "../db";
import {
  DuplicateEmailException,
  DuplicateUsernameException,
} from "./user.exception";

@Injectable()
export class UserRepository {
  constructor(private readonly db: Database) {}

  /**
   * Inserts the specified user into the database.
   *
   * @param newUser - Info on the new user. The specified password of the user
   * should be hashed with bcrypt.
   * @returns Resolves to the newly created user.
   *
   * @throws {DuplicateEmailException}
   * @throws {DuplicateUsernameException}
   */
  async insert(
    newUser: Pick<NewUser, "username" | "email" | "password">,
  ): Promise<User> {
    try {
      const query = this.db.insertInto("users").values(newUser).returningAll();
      const user = await query.executeTakeFirstOrThrow();
      return user;
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (e.constraint == "users_username_idx") {
          throw new DuplicateUsernameException(newUser.username);
        }
        if (e.constraint == "users_email_idx") {
          throw new DuplicateEmailException(newUser.email);
        }
      }
      throw e;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = this.db
      .selectFrom("users")
      .selectAll()
      .where(this.db.fn("lower", ["email"]), "=", email.toLowerCase());
    const user = await query.executeTakeFirst();
    return user || null;
  }

  async insertSession(
    newSession: Pick<NewSession, "userId" | "createdAt" | "expiresAt">,
  ): Promise<Session> {
    const query = this.db
      .insertInto("sessions")
      .values(newSession)
      .returningAll();
    const session = await query.executeTakeFirstOrThrow();
    return session;
  }

  async findSessionById(
    id: string,
  ): Promise<{ session: Session; user: User } | null> {
    let query = this.db
      .selectFrom("sessions")
      .innerJoin("users", "users.id", "sessions.userId")
      .select([
        "users.id as userId",
        "sessions.id as sessionId",
        "sessions.createdAt as sessionCreatedAt",
        "users.createdAt as userCreatedAt",
        "expiresAt",
        "password",
        "email",
        "username",
      ])
      .where("sessions.id", "=", id);

    const result = await query.executeTakeFirst();

    if (result == undefined) {
      return null;
    }

    return {
      session: {
        id: result.sessionId,
        createdAt: result.sessionCreatedAt,
        userId: result.userId,
        expiresAt: result.expiresAt,
      },
      user: {
        id: result.userId,
        username: result.username,
        password: result.password,
        email: result.email,
        createdAt: result.userCreatedAt,
      },
    };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const query = this.db.deleteFrom("sessions").where("id", "=", sessionId);
    const result = await query.executeTakeFirst();
    return result.numDeletedRows == 1n;
  }
}
