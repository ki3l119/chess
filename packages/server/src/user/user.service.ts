import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

import { UserDto, CreateUserDto } from "chess-shared-types";
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
}
