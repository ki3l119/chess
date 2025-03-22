import { Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

import {
  UserDto,
  CreateUserDto,
  LoginDto,
  SessionDto,
} from "chess-shared-types";
import {
  DuplicateEmailException,
  DuplicateUsernameException,
  UserNotFoundException,
} from "./user.exception";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  static readonly PASSWORD_SALT_ROUNDS_DEPENDENCY_TOKEN =
    "PASSWORD_SALT_ROUNDS";
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(UserService.PASSWORD_SALT_ROUNDS_DEPENDENCY_TOKEN)
    private readonly passwordSaltRounds: number,
  ) {}

  /**
   * Creates a new user.
   *
   * @param createUserDto - Info regarding the new user.
   * @returns Resolves to the newly created user.
   *
   * @throws {DuplicateEmailException}
   * @throws {DuplicateUsernameException}
   */
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.passwordSaltRounds,
    );
    const user = await this.userRepository.insert({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  /**
   * Creates a login session for the user.
   *
   * @param loginDto - The user's credentials.
   * @returns If the user's credentials are valid, resolves to the user and
   * newly created login session; otherwise, resolves to null.
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserDto; session: SessionDto } | null> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (user == null) {
      return null;
    }
    const isPasswordCorrect = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return null;
    }
    const today = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    const session = await this.userRepository.insertSession({
      userId: user.id,
      createdAt: today,
      expiresAt: expirationDate,
    });
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      session: {
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      },
    };
  }

  /**
   * Checks if the session exists and has not expired.
   *
   * @param id - The id of the session.
   * @returns Resolves to the user for valid sessions; otherwise, resolves to
   * null.
   */
  async validateSession(id: string): Promise<UserDto | null> {
    const result = await this.userRepository.findSessionById(id);
    if (result == null) {
      return null;
    }

    const today = new Date();

    if (today.getTime() >= result.session.expiresAt.getTime()) {
      return null;
    }

    return {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
    };
  }

  /**
   * Removes the session of the user.
   *
   * @param sessionId - The id of the session.
   * @returns Wether the session was deleted successfully.
   */
  async logout(sessionId: string): Promise<boolean> {
    return this.userRepository.deleteSession(sessionId);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.passwordSaltRounds,
    );
    const updateResult = await this.userRepository.update(userId, {
      password: hashedPassword,
    });
    if (!updateResult) {
      throw new Error("Failed to update user password.");
    }
    return true;
  }
}
