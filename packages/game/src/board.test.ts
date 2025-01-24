import { describe, it, expect } from "@jest/globals";

import { parseFEN, startingBoardFENString } from "./utils/fen-parser";
import {
  BoardCoordinate,
  BoardCoordinateOffset,
  BoardElement,
  Direction,
} from "./board";
import { Piece, PIECES } from "./models/piece";

describe("Board", () => {
  const { board: startingBoard } = parseFEN(startingBoardFENString);
  describe("traverseDirection", () => {
    it.each([
      [
        Direction.NORTH,
        [
          new BoardCoordinate(4, 4),
          new BoardCoordinate(5, 4),
          new BoardCoordinate(6, 4),
          new BoardCoordinate(7, 4),
        ],
      ],
      [
        Direction.SOUTH,
        [
          new BoardCoordinate(2, 4),
          new BoardCoordinate(1, 4),
          new BoardCoordinate(0, 4),
        ],
      ],
      [
        Direction.EAST,
        [
          new BoardCoordinate(3, 5),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(3, 7),
        ],
      ],
      [
        Direction.WEST,
        [
          new BoardCoordinate(3, 3),
          new BoardCoordinate(3, 2),
          new BoardCoordinate(3, 1),
          new BoardCoordinate(3, 0),
        ],
      ],
      [
        Direction.NORTH_EAST,
        [
          new BoardCoordinate(4, 5),
          new BoardCoordinate(5, 6),
          new BoardCoordinate(6, 7),
        ],
      ],
      [
        Direction.NORTH_WEST,
        [
          new BoardCoordinate(4, 3),
          new BoardCoordinate(5, 2),
          new BoardCoordinate(6, 1),
          new BoardCoordinate(7, 0),
        ],
      ],
      [
        Direction.SOUTH_EAST,
        [
          new BoardCoordinate(2, 5),
          new BoardCoordinate(1, 6),
          new BoardCoordinate(0, 7),
        ],
      ],
      [
        Direction.SOUTH_WEST,
        [
          new BoardCoordinate(2, 3),
          new BoardCoordinate(1, 2),
          new BoardCoordinate(0, 1),
        ],
      ],
    ])(
      "Traverses specified direction until the end of the board (%s)",
      (direction, expected) => {
        const origin = new BoardCoordinate(3, 4);
        const actual = Array.from(
          startingBoard.traverseDirection(origin, direction),
        );
        expect(actual).toStrictEqual(expected);
      },
    );

    it("Provides no coordinates if no squares towards given direction", () => {
      const origin = new BoardCoordinate(7, 7);
      const direction = Direction.EAST;
      const expected: BoardCoordinate[] = [];

      const actual = Array.from(
        startingBoard.traverseDirection(origin, direction),
      );

      expect(actual).toStrictEqual(expected);
    });

    it("Does not exceed max steps if specified", () => {
      const origin = new BoardCoordinate(5, 3);
      const direction = Direction.SOUTH_EAST;
      const maxSteps = 2;
      const expected: BoardCoordinate[] = [
        new BoardCoordinate(4, 4),
        new BoardCoordinate(3, 5),
      ];

      const actual = Array.from(
        startingBoard.traverseDirection(origin, direction, { maxSteps }),
      );
      expect(actual).toStrictEqual(expected);
    });
  });

  describe("traverseOffsets", () => {
    it("Traverses all offsets within board", () => {
      const origin = new BoardCoordinate(3, 5);
      const offsets: BoardCoordinateOffset[] = [
        {
          rank: -1,
          file: -3,
        },
        {
          rank: 1,
          file: 1,
        },
        {
          rank: -3,
          file: 2,
        },
      ];
      const expected = [
        new BoardCoordinate(2, 2),
        new BoardCoordinate(4, 6),
        new BoardCoordinate(0, 7),
      ];

      const actual = Array.from(startingBoard.traverseOffsets(origin, offsets));
      expect(actual).toStrictEqual(expected);
    });

    it("Does not include coordinates outside of the board", () => {
      const origin = new BoardCoordinate(0, 1);
      const offsets: BoardCoordinateOffset[] = [
        {
          rank: 0,
          file: 1,
        },
        {
          rank: 1,
          file: -2,
        },
        {
          rank: 3,
          file: -1,
        },
      ];
      const expected = [new BoardCoordinate(0, 2), new BoardCoordinate(3, 0)];

      const actual = Array.from(startingBoard.traverseOffsets(origin, offsets));
      expect(actual).toStrictEqual(expected);
    });

    describe("pieces", () => {
      it("Iterates over all pieces in the board", () => {
        const expected = [
          {
            piece: PIECES["R"],
            coordinate: new BoardCoordinate(0, 0),
          },
          {
            piece: PIECES["N"],
            coordinate: new BoardCoordinate(0, 1),
          },
          {
            piece: PIECES["B"],
            coordinate: new BoardCoordinate(0, 2),
          },
          {
            piece: PIECES["Q"],
            coordinate: new BoardCoordinate(0, 3),
          },
          {
            piece: PIECES["K"],
            coordinate: new BoardCoordinate(0, 4),
          },
          {
            piece: PIECES["B"],
            coordinate: new BoardCoordinate(0, 5),
          },
          {
            piece: PIECES["N"],
            coordinate: new BoardCoordinate(0, 6),
          },
          {
            piece: PIECES["R"],
            coordinate: new BoardCoordinate(0, 7),
          },
          ...new Array<BoardElement>(8)
            .fill(PIECES["P"])
            .map((piece, index) => ({
              piece: piece,
              coordinate: new BoardCoordinate(1, index),
            })),
          ...new Array<BoardElement>(8)
            .fill(PIECES["p"])
            .map((piece, index) => ({
              piece: piece,
              coordinate: new BoardCoordinate(6, index),
            })),
          {
            piece: PIECES["r"],
            coordinate: new BoardCoordinate(7, 0),
          },
          {
            piece: PIECES["n"],
            coordinate: new BoardCoordinate(7, 1),
          },
          {
            piece: PIECES["b"],
            coordinate: new BoardCoordinate(7, 2),
          },
          {
            piece: PIECES["q"],
            coordinate: new BoardCoordinate(7, 3),
          },
          {
            piece: PIECES["k"],
            coordinate: new BoardCoordinate(7, 4),
          },
          {
            piece: PIECES["b"],
            coordinate: new BoardCoordinate(7, 5),
          },
          {
            piece: PIECES["n"],
            coordinate: new BoardCoordinate(7, 6),
          },
          {
            piece: PIECES["r"],
            coordinate: new BoardCoordinate(7, 7),
          },
        ];

        const actual = Array.from(startingBoard.pieces());
        expect(actual).toStrictEqual(expected);
      });

      it("Yields no elements if no pieces in board", () => {
        const { board: emptyBoard } = parseFEN("8/8/8/8/8/8/8/8 w - - 0 1");
        const expected: Piece[] = [];

        const actual = Array.from(emptyBoard.pieces());
        expect(actual).toStrictEqual(expected);
      });
    });

    describe("getPieces", () => {
      it("Returns piece if square is occupied", () => {
        const coordinate = new BoardCoordinate(0, 5);
        const expected = PIECES["B"];
        const actual = startingBoard.getPiece(coordinate);
        expect(actual).toStrictEqual(expected);
      });

      it("Returns null if square is not occupied", () => {
        const coordinate = new BoardCoordinate(2, 5);
        const actual = startingBoard.getPiece(coordinate);
        expect(actual).toStrictEqual(null);
      });
    });
  });
});
