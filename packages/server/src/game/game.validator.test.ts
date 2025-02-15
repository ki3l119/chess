import { describe, it, expect } from "@jest/globals";

import {
  createGameDtoSchema,
  joinGameDtoSchema,
  moveDtoSchema,
} from "./game.validator";
import { randomUUID } from "crypto";

describe("Game DTO validation schemas", () => {
  describe("createGameDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        color: "WHITE",
      };
      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual({
        color: "WHITE",
        playerTimerDuration: 600,
      });
    });

    it("Capitalizes color input", () => {
      const input = {
        color: "black",
      };
      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual({
        color: "BLACK",
        playerTimerDuration: 600,
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

    it("Error on undefined", () => {
      const actual = createGameDtoSchema.validate(undefined);
      expect(actual.error);
    });

    it("Accepts valid player timer duration", () => {
      const input = {
        color: "WHITE",
        playerTimerDuration: 200,
      };
      const actual = createGameDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(input);
    });

    it.each([-2, 3, 3601, 2.76])(
      "Error on invalid player timer duration (%#)",
      (timerDurationInput) => {
        const input = {
          color: "WHITE",
          playerTimerDuration: timerDurationInput,
        };
        const actual = createGameDtoSchema.validate(input);
        expect(actual.error).toBeDefined();
        expect(actual.error!.details.length).toBe(1);
        expect(actual.error!.details[0].path).toEqual(["playerTimerDuration"]);
      },
    );
  });

  describe("joinGameDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        gameId: randomUUID(),
      };

      const actual = joinGameDtoSchema.validate(input);

      expect(actual.value).toEqual(input);
    });

    it("Trims game id", () => {
      const gameId = randomUUID();

      const actual = joinGameDtoSchema.validate({
        gameId: "  " + gameId + "     ",
      });

      expect(actual.value).toEqual({
        gameId,
      });
    });

    it("Error on non-uuid game id", () => {
      const input = {
        gameId: "fdafadfadfadf",
      };

      const actual = joinGameDtoSchema.validate(input);

      expect(actual.error?.details.length).toBe(1);
      expect(actual.error?.details[0].path).toEqual(["gameId"]);
    });
  });

  describe("moveDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        from: {
          rank: 0,
          file: 2,
        },
        to: {
          rank: 7,
          file: 7,
        },
      };

      const actual = moveDtoSchema.validate(input);

      expect(actual.value).toEqual(input);
    });

    it("Error on when provided with coordinates outside board range", () => {
      const input = {
        from: {
          rank: -1,
          file: 2,
        },
        to: {
          rank: 7,
          file: 8,
        },
      };

      const actual = moveDtoSchema.validate(input, { abortEarly: false });

      expect(actual.error?.details.length).toBe(2);
      expect(actual.error?.details.map((value) => value.path).sort()).toEqual([
        ["from", "rank"],
        ["to", "file"],
      ]);
    });
  });
});
