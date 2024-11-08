import { describe, expect, it } from "@jest/globals";

import { createUserDtoSchema } from "./user.validator";

describe("User DTO validation schemas", () => {
  describe("createUserDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        username: "test",
        password: "p@ssword",
        email: "test@test.com",
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(input);
    });

    it("Username and email are trimmed", () => {
      const input = {
        username: "    test123_   ",
        password: "p@ssword",
        email: "     test@test.com    ",
      };

      const expected = {
        username: "test123_",
        password: "p@ssword",
        email: "test@test.com",
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(expected);
    });

    it.each(["username with spaces", "non-alphanumeric*(*(@&*#", "", "     "])(
      "Error on invalid username (input='%s')",
      (username) => {
        const input = {
          username,
          password: "p@ssword",
          email: "test@test.com",
        };

        const actual = createUserDtoSchema.validate(input);
        expect(actual.error).toBeDefined();
        expect(actual.error!.details.length).toBe(1);
        expect(actual.error!.details[0].path).toEqual(["username"]);
      },
    );

    it("Error on username with more than 50 characters", () => {
      const input = {
        username: "a".repeat(51),
        password: "p@ssword",
        email: "test@test.com",
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeDefined();
      expect(actual.error!.details.length).toBe(1);
      expect(actual.error!.details[0].path).toEqual(["username"]);
    });

    it("Error password with less than 8 characters", () => {
      const input = {
        username: "test",
        password: "p@sswor",
        email: "test@test.com",
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeDefined();
      expect(actual.error!.details.length).toBe(1);
      expect(actual.error!.details[0].path).toEqual(["password"]);
    });

    it("Error password with more than 128 characters", () => {
      const input = {
        username: "test",
        password: "p".repeat(129),
        email: "test@test.com",
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeDefined();
      expect(actual.error!.details.length).toBe(1);
      expect(actual.error!.details[0].path).toEqual(["password"]);
    });

    it.each(["", "  ", "no_domain", "@domain.com"])(
      "Error on invalid email (input='%s')",
      (email) => {
        const input = {
          username: "test",
          password: "p@ssword",
          email,
        };

        const actual = createUserDtoSchema.validate(input);
        expect(actual.error).toBeDefined();
        expect(actual.error!.details.length).toBe(1);
        expect(actual.error!.details[0].path).toEqual(["email"]);
      },
    );

    it("Error on email with more than 350 characters", () => {
      const input = {
        username: "test",
        password: "p@ssword",
        email: `${"b".repeat(341)}@test.com`,
      };

      const actual = createUserDtoSchema.validate(input);
      expect(actual.error).toBeDefined();
      expect(actual.error!.details.length).toBe(1);
      expect(actual.error!.details[0].path).toEqual(["email"]);
    });
  });
});
