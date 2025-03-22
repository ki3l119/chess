import bcrypt from "bcrypt";
import { describe, jest, it, expect, afterEach } from "@jest/globals";

import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { CreateUserDto, LoginDto, UserDto } from "chess-shared-types";
import {
  DuplicateEmailException,
  DuplicateUsernameException,
  UserNotFoundException,
} from "./user.exception";

describe("UserService", () => {
  const PASSWORD_SALT_ROUNDS = 10;
  const userRepositoryMock = {
    insert: jest.fn<typeof UserRepository.prototype.insert>(),
    findByEmail: jest.fn<typeof UserRepository.prototype.findByEmail>(),
    insertSession: jest.fn<typeof UserRepository.prototype.insertSession>(),
    findSessionById: jest.fn<typeof UserRepository.prototype.findSessionById>(),
    deleteSession: jest.fn<typeof UserRepository.prototype.deleteSession>(),
    findById: jest.fn<typeof UserRepository.prototype.findById>(),
    update: jest.fn<typeof UserRepository.prototype.update>(),
  };
  const userService = new UserService(
    userRepositoryMock as unknown as UserRepository,
    PASSWORD_SALT_ROUNDS,
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

    it("Rethrows DuplicateEmailException from repository", async () => {
      userRepositoryMock.insert.mockImplementationOnce(() =>
        Promise.reject(new DuplicateEmailException("test@gmail.com")),
      );

      const actual = userService.create({
        username: "test",
        email: "test@gmail.com",
        password: "p@ssword",
      });

      await expect(actual).rejects.toBeInstanceOf(DuplicateEmailException);
    });

    it("Rethrows DuplicateUsernameException from repository", async () => {
      userRepositoryMock.insert.mockImplementationOnce(() =>
        Promise.reject(new DuplicateUsernameException("test")),
      );

      const actual = userService.create({
        username: "test",
        email: "test@gmail.com",
        password: "p@ssword",
      });

      await expect(actual).rejects.toBeInstanceOf(DuplicateUsernameException);
    });
  });

  describe("login", () => {
    it("Creates new session on valid credentials", async () => {
      const input: LoginDto = {
        email: "test@gmail.com",
        password: "p@ssword",
      };

      const dummyUserId = "6680afcd-2e05-45b7-9376-b5a48473e101";
      const dummySessionId = "cc94cd85-8b7e-42b1-b594-8de55bd641d5";

      userRepositoryMock.findByEmail.mockImplementationOnce((email) => {
        const creationDate = new Date();
        creationDate.setDate(creationDate.getDate() - 60);
        return Promise.resolve({
          id: dummyUserId,
          username: "test",
          createdAt: creationDate,
          password: bcrypt.hashSync(input.password, 10),
          email,
        });
      });

      userRepositoryMock.insertSession.mockImplementationOnce((newSession) => {
        return Promise.resolve({
          id: dummySessionId,
          userId: dummyUserId,
          createdAt: newSession.createdAt || new Date(),
          expiresAt: newSession.expiresAt,
        });
      });

      const actual = await userService.login(input);

      expect(actual).not.toBeNull();
      expect(actual!.session.id).toEqual(dummySessionId);
      expect(actual!.user.id).toEqual(dummyUserId);
    });

    it("Returns null if no user has the given email", async () => {
      const input: LoginDto = {
        email: "test@gmail.com",
        password: "p@ssword",
      };

      userRepositoryMock.findByEmail.mockResolvedValueOnce(null);

      const actual = await userService.login(input);

      expect(actual).toBeNull();
    });

    it("Returns null if wrong password", async () => {
      const input: LoginDto = {
        email: "test@gmail.com",
        password: "p@ssword",
      };

      const dummyUserId = "6680afcd-2e05-45b7-9376-b5a48473e101";

      userRepositoryMock.findByEmail.mockImplementationOnce((email) => {
        const creationDate = new Date();
        creationDate.setDate(creationDate.getDate() - 60);
        return Promise.resolve({
          id: dummyUserId,
          username: "test",
          createdAt: creationDate,
          password: bcrypt.hashSync("origina-password", 10),
          email,
        });
      });

      const actual = await userService.login(input);
      expect(actual).toBeNull();
    });
  });

  describe("validateSession", () => {
    const dummyUserId = "6680afcd-2e05-45b7-9376-b5a48473e101";
    const findSessionMockImplementation = (id: string) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - 10);
      const expiresAt = new Date(createdAt.getTime());
      expiresAt.setDate(createdAt.getDate() + 30);
      const userCreation = new Date();
      userCreation.setDate(userCreation.getDate() - 70);
      return Promise.resolve({
        session: {
          id,
          createdAt,
          expiresAt,
          userId: dummyUserId,
        },
        user: {
          id: dummyUserId,
          username: "username",
          email: "test@email.com",
          createdAt: userCreation,
          password: bcrypt.hashSync("p@ssword", 10),
        },
      });
    };

    it("Resolves to user on valid session", async () => {
      const input = "d24aa6a1-835f-401d-afd9-2c826a728ef5";

      userRepositoryMock.findSessionById.mockImplementationOnce(
        findSessionMockImplementation,
      );

      const actual = await userService.validateSession(input);
      expect(actual).not.toBeNull();
      expect(actual!.id).toEqual(dummyUserId);
    });

    it("Resolves to null on expired session", async () => {
      const input = "d24aa6a1-835f-401d-afd9-2c826a728ef5";

      userRepositoryMock.findSessionById.mockImplementationOnce(async (id) => {
        const mockResult = await findSessionMockImplementation(id);
        mockResult.session.expiresAt = new Date();
        mockResult.session.expiresAt.setDate(
          mockResult.session.expiresAt.getDate() - 1,
        );
        return mockResult;
      });

      const actual = await userService.validateSession(input);
      expect(actual).toBeNull();
    });
  });

  describe("logout", () => {
    it("Resolves to true on successful session delete", async () => {
      const input = "d24aa6a1-835f-401d-afd9-2c826a728ef5";

      userRepositoryMock.deleteSession.mockResolvedValueOnce(true);

      const actual = await userService.logout(input);

      expect(actual).toBe(true);
    });

    it("Resolves to false on successful session delete", async () => {
      const input = "d24aa6a1-835f-401d-afd9-2c826a728ef5";

      userRepositoryMock.deleteSession.mockResolvedValueOnce(false);

      const actual = await userService.logout(input);

      expect(actual).toBe(false);
    });
  });

  describe("changePassword", () => {
    it("Resolves to true on successful password change", async () => {
      const oldPassword = "p@ssword";
      const hashedOldPassword = bcrypt.hashSync(
        oldPassword,
        PASSWORD_SALT_ROUNDS,
      );
      const dummyId = "6680afcd-2e05-45b7-9376-b5a48473e101";
      userRepositoryMock.findById.mockResolvedValueOnce({
        id: dummyId,
        username: "user",
        password: hashedOldPassword,
        email: "test@gmail.com",
        createdAt: new Date(),
      });

      userRepositoryMock.update.mockResolvedValueOnce(true);

      const newPassword = "new-password";
      const actual = await userService.changePassword(
        dummyId,
        oldPassword,
        newPassword,
      );

      expect(userRepositoryMock.update.mock.calls.length).toBe(1);
      expect(userRepositoryMock.update.mock.calls[0][1]).not.toEqual(
        hashedOldPassword,
      );
      // Ensure new password is hashed
      expect(userRepositoryMock.update.mock.calls[0][1]).not.toEqual(
        newPassword,
      );
      expect(actual).toBe(true);
    });

    it("Throws UserNotFoundException when no user is found", async () => {
      userRepositoryMock.findById.mockResolvedValueOnce(null);
      expect(
        userService.changePassword(
          "6680afcd-2e05-45b7-9376-b5a48473e101",
          "old-password",
          "new-password",
        ),
      ).rejects.toBeInstanceOf(UserNotFoundException);
    });

    it("Does not update if old password is wrong", async () => {
      const dummyId = "6680afcd-2e05-45b7-9376-b5a48473e101";
      userRepositoryMock.findById.mockResolvedValueOnce({
        id: dummyId,
        username: "user",
        password: bcrypt.hashSync("p@ssword", PASSWORD_SALT_ROUNDS),
        email: "test@gmail.com",
        createdAt: new Date(),
      });

      userRepositoryMock.update.mockResolvedValueOnce(true);

      const newPassword = "new-password";
      const actual = await userService.changePassword(
        dummyId,
        "wrong-old-password",
        newPassword,
      );

      expect(userRepositoryMock.update.mock.calls.length).toBe(0);
      expect(actual).toBe(false);
    });
  });
});
