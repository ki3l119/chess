import { describe, it, expect } from "@jest/globals";

import {
  createGameDtoSchema,
  getGameHistoryQuerySchema,
  joinGameDtoSchema,
  newMoveDtoSchema,
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

  describe("newMoveDtoSchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        move: {
          from: {
            rank: 0,
            file: 2,
          },
          to: {
            rank: 7,
            file: 7,
          },
        },
      };

      const actual = newMoveDtoSchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(input);
    });

    it("Error on when provided with coordinates outside board range", () => {
      const input = {
        move: {
          from: {
            rank: -1,
            file: 2,
          },
          to: {
            rank: 7,
            file: 8,
          },
        },
      };

      const actual = newMoveDtoSchema.validate(input, { abortEarly: false });

      expect(actual.error?.details.length).toBe(2);
      expect(actual.error?.details.map((value) => value.path).sort()).toEqual([
        ["move", "from", "rank"],
        ["move", "to", "file"],
      ]);
    });

    it.each(["Q", "N", "B", "R"])(
      'No errors on valid pawn promotion piece ("%s")',
      (pieceInput) => {
        const input = {
          move: {
            from: {
              rank: 0,
              file: 2,
            },
            to: {
              rank: 7,
              file: 7,
            },
          },
          pawnPromotionPiece: pieceInput,
        };

        const actual = newMoveDtoSchema.validate(input);
        expect(actual.error).toBeUndefined();
        expect(actual.value).toEqual(input);
      },
    );

    it("Error on invalid pawn promotion piece", () => {
      const input = {
        move: {
          from: {
            rank: 0,
            file: 2,
          },
          to: {
            rank: 7,
            file: 7,
          },
        },
        pawnPromotionPiece: "K",
      };

      const actual = newMoveDtoSchema.validate(input);
      expect(actual.error?.details.length).toBe(1);
      expect(actual.error?.details[0].path).toEqual(["pawnPromotionPiece"]);
    });
  });

  describe("getGameHistoryQuerySchema", () => {
    it("No errors on valid DTO", () => {
      const input = {
        page: 10,
        pageSize: 35,
      };

      const actual = getGameHistoryQuerySchema.validate(input);
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual(input);
    });

    it("Defaults to 1st page with 50 page size if not set", () => {
      const actual = getGameHistoryQuerySchema.validate({});
      expect(actual.error).toBeUndefined();
      expect(actual.value).toEqual({
        page: 1,
        pageSize: 50,
      });
    });

    it("Error if pageSize exceeds max value", () => {
      const input = {
        pageSize: 101,
      };

      const actual = getGameHistoryQuerySchema.validate(input, {
        abortEarly: false,
      });
      expect(actual.error?.details.length).toBe(1);
      expect(actual.error?.details[0].path).toEqual(["pageSize"]);
    });
  });
});
