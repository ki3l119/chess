import { describe, jest, it, expect } from "@jest/globals";

import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { afterEach } from "node:test";
import { CreateUserDto, UserDto } from "chess-shared-types";
import { InvalidUserException } from "./user.exception";

describe("UserService", () => {
  const userRepositoryMock = {
    insert: jest.fn<typeof UserRepository.prototype.insert>(),
  };
  const userService = new UserService(
    userRepositoryMock as unknown as UserRepository,
  );

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("Resolves to new user on successful creation", async () => {
      const input: CreateUserDto = {
        username: "test",
        email: "test@gmail.com",
        password: "p@ssword",
      };

      const dummyId = "6680afcd-2e05-45b7-9376-b5a48473e101";

      userRepositoryMock.insert.mockImplementationOnce((newUser) =>
        Promise.resolve({
          id: dummyId,
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          createdAt: new Date(),
        }),
      );

      const expected: UserDto = {
        id: dummyId,
        username: input.username,
        email: input.email,
      };

      const actual = await userService.create(input);

      // Ensure password is not stored in plain text
      expect(userRepositoryMock.insert.mock.calls[0][0].password).not.toEqual(
        input.password,
      );
      expect(actual).toEqual(expected);
    });

    it("Rethrows InvalidUserException from repository", async () => {
      userRepositoryMock.insert.mockImplementationOnce(() =>
        Promise.reject(new InvalidUserException("Username already exists.")),
      );

      const actual = userService.create({
        username: "test",
        email: "test@gmail.com",
        password: "p@ssword",
      });

      await expect(actual).rejects.toBeInstanceOf(InvalidUserException);
    });
  });
});
