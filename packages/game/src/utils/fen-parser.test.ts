import { it, describe, expect } from "@jest/globals";

import { parseFEN, ParseFENException, ParseFENResult } from "./fen-parser";
import { Piece, PieceColor, PIECES } from "../models/piece";
import { Board, BoardSquare } from "../models/board";

describe("parseFEN", () => {
  it("Parses starting position", () => {
    const actual = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );

    const expectedPosition: Board = [
      [
        PIECES["R"],
        PIECES["N"],
        PIECES["B"],
        PIECES["Q"],
        PIECES["K"],
        PIECES["B"],
        PIECES["N"],
        PIECES["R"],
      ],
      new Array<Piece>(8).fill(PIECES["P"]),
      ...new Array(4).fill(null).map(() => new Array<null>(8).fill(null)),
      new Array<Piece>(8).fill(PIECES["p"]),
      [
        PIECES["r"],
        PIECES["n"],
        PIECES["b"],
        PIECES["q"],
        PIECES["k"],
        PIECES["b"],
        PIECES["n"],
        PIECES["r"],
      ],
    ];

    const expectedResult: ParseFENResult = {
      board: expectedPosition,
      activeColor: PieceColor.WHITE,
      castlingRights: {
        [PieceColor.WHITE]: {
          kingside: true,
          queenside: true,
        },
        [PieceColor.BLACK]: {
          kingside: true,
          queenside: true,
        },
      },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveCount: 1,
    };

    expect(actual).toEqual(expectedResult);
  });

  it("Parses a midgame position", () => {
    const actual = parseFEN(
      "r4b1r/pp1Qpkpp/2p4q/8/8/2N5/PPPP1PPP/R1B2RK1 b - - 0 11",
    );

    const expectedPosition: Board = [
      [
        PIECES["R"],
        null,
        PIECES["B"],
        null,
        null,
        PIECES["R"],
        PIECES["K"],
        null,
      ],
      [
        PIECES["P"],
        PIECES["P"],
        PIECES["P"],
        PIECES["P"],
        null,
        PIECES["P"],
        PIECES["P"],
        PIECES["P"],
      ],
      [null, null, PIECES["N"], null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      new Array<null>(8).fill(null),
      [null, null, PIECES["p"], null, null, null, null, PIECES["q"]],
      [
        PIECES["p"],
        PIECES["p"],
        null,
        PIECES["Q"],
        PIECES["p"],
        PIECES["k"],
        PIECES["p"],
        PIECES["p"],
      ],
      [PIECES["r"], null, null, null, null, PIECES["b"], null, PIECES["r"]],
    ];

    const expected: ParseFENResult = {
      board: expectedPosition,
      activeColor: PieceColor.BLACK,
      castlingRights: {
        [PieceColor.WHITE]: {
          kingside: false,
          queenside: false,
        },
        [PieceColor.BLACK]: {
          kingside: false,
          queenside: false,
        },
      },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveCount: 11,
    };

    expect(actual).toEqual(expected);
  });

  it.each([
    "rnbqkbnr/pppppppp/8/8/9/8/PPPPPPPP/RNBQKBNR",
    "rnbqkbnr/pppppppp/8/3/8/8/PPPPPPPP/RNBQKBNR",
    "rnbqkbnrrb/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    "rnbqkbnr/ppppappp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    "rnbqkbnr/pppppppp/8/8/8/8/RNBQKBNR",
    "daafasdfasdfas",
    "",
  ])("Throws exception on invalid board (%#)", (boardPositionInput) => {
    expect(() => {
      parseFEN(`${boardPositionInput} w KQkq - 0 1`);
    }).toThrow(ParseFENException);
  });

  it("Throws exception on invalid color", () => {
    expect(() => {
      parseFEN(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR H KQkq - 0 1`);
    }).toThrow(ParseFENException);
  });

  it.each([
    [
      "KQ",
      {
        [PieceColor.WHITE]: {
          kingside: true,
          queenside: true,
        },
        [PieceColor.BLACK]: {
          kingside: false,
          queenside: false,
        },
      },
    ],
    [
      "kq",
      {
        [PieceColor.WHITE]: {
          kingside: false,
          queenside: false,
        },
        [PieceColor.BLACK]: {
          kingside: true,
          queenside: true,
        },
      },
    ],
    [
      "-",
      {
        [PieceColor.WHITE]: {
          kingside: false,
          queenside: false,
        },
        [PieceColor.BLACK]: {
          kingside: false,
          queenside: false,
        },
      },
    ],
    [
      "K",
      {
        [PieceColor.WHITE]: {
          kingside: true,
          queenside: false,
        },
        [PieceColor.BLACK]: {
          kingside: false,
          queenside: false,
        },
      },
    ],
  ])("Parses castling rights", (castlingRightsInput, expected) => {
    const actual = parseFEN(
      `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w ${castlingRightsInput} - 0 1`,
    );
    expect(actual.castlingRights).toEqual(expected);
  });

  it("Throws exception on invalid castling rights", () => {
    expect(() => {
      parseFEN(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w fadsfasdfaf - 0 1",
      );
    }).toThrow(ParseFENException);
  });

  it("Parses en passant target if defined", () => {
    const actual = parseFEN(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    );
    const expected: BoardSquare = {
      file: 4,
      rank: 2,
    };
    expect(actual.enPassantTarget).toEqual(expected);
  });

  it("Throws exception on invalid halfmove clock", () => {
    expect(() => {
      parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - a2 1");
    }).toThrow(ParseFENException);
  });

  it("Throws exception on invalid fullmove number", () => {
    expect(() => {
      parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0");
    }).toThrow(ParseFENException);
  });
});
