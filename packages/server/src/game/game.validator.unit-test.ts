import { describe, it, expect } from "@jest/globals";

import { createGameDtoSchema } from "./game.validator";

describe("Game DTO validation schemas", () => {
  describe("createGameDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        color: "WHITE",
      };
      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(input);
    });

    it("Capitalizes color input", () => {
      const input = {
        color: "black",
      };
      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual({
        color: "BLACK",
      });
    });

    it("Error on invalid color", () => {
      const input = {
        color: "red",
      };

      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeDefined();
      expect(actual.error!.details.length).toBe(1);
      expect(actual.error!.details[0].path).toEqual(["color"]);
    });
  });
});
