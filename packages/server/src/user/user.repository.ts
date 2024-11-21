import { Injectable } from "@nestjs/common";
import { DatabaseError } from "pg";

import { User, NewUser, Database } from "../db";
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
}
