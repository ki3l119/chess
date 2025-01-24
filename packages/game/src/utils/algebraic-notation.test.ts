import { describe, it, expect } from "@jest/globals";

import { parseSquare } from "./algebraic-notation";
import { BoardCoordinate } from "../board";

describe("parseSquare", () => {
  it.each([
    ["a1", new BoardCoordinate(0, 0)],
    ["c4", new BoardCoordinate(3, 2)],
    ["c5", new BoardCoordinate(4, 2)],
    ["h8", new BoardCoordinate(7, 7)],
  ])("Parses valid algebraic notation (%s)", (input, expected) => {
    const actual = parseSquare(input);
    expect(actual).toStrictEqual(expected);
  });

  it.each(["i7", "c9"])(
    "Returns null on invalid algebraic notation (%s)",
    (input) => {
      const actual = parseSquare(input);
      expect(actual).toEqual(null);
    },
  );
});
