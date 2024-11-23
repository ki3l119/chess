import { Injectable } from "@nestjs/common";
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
} from "./user.exception";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
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
   * @returns If the user's credentials are valid, resolves to the newly created
   * login session; otherwise, resolves to null.
   */
  async login(loginDto: LoginDto): Promise<SessionDto | null> {
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
    return session;
  }
}
