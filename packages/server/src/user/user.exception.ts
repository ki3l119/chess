import { UserErrorException } from "../common";

export class DuplicateEmailException extends UserErrorException {
  constructor(readonly email: string) {
    super({
      title: "Email already exists.",
      details: `The email "${email}" is already in use.`,
    });
  }
}

export class DuplicateUsernameException extends UserErrorException {
  constructor(readonly username: string) {
    super({
      title: "Username already exists.",
      details: `The username "${username}" is already in use.`,
    });
  }
}

export class UserNotFoundException extends UserErrorException {
  constructor(readonly userId: string) {
    super({
      title: "User not found.",
      details: `User with id "${userId}" not found.`,
    });
  }
}
