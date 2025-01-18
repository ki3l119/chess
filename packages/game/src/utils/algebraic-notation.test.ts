import { describe, it, expect } from "@jest/globals";

import { parseSquare } from "./algebraic-notation";

describe("parseSquare", () => {
  it.each([
    ["a1", { file: 0, rank: 0 }],
    ["c4", { file: 2, rank: 3 }],
    ["c5", { file: 2, rank: 4 }],
    ["h8", { file: 7, rank: 7 }],
  ])("Parses valid algebraic notation (%s)", (input, expected) => {
    const actual = parseSquare(input);
    expect(actual).toEqual(expected);
  });

  it.each(["i7", "c9"])(
    "Returns null on invalid algebraic notation (%s)",
    (input) => {
      const actual = parseSquare(input);
      expect(actual).toEqual(null);
    },
  );
});
