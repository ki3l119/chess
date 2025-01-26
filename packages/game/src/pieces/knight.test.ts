import { describe, it } from "@jest/globals";

import { BoardCoordinate } from "../board";
import { PieceColor } from "./piece";
import { Knight } from "./knight";
import { testPieceMovement } from "../../.jest/piece-utils";

function testKnightMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const knight = new Knight(color);
  testPieceMovement(knight, gameFEN, origin, expected);
}

describe("Knight", () => {
  describe("generatePseudoLegalMove", () => {
    it("Moves in L-shape from current position", () => {
      testKnightMovement(
        PieceColor.WHITE,
        "4Qnk1/p4pp1/np6/1N1P3p/1PB5/P4NK1/8/R7 w - - 0 32",
        new BoardCoordinate(2, 5),
        [
          new BoardCoordinate(3, 3),
          new BoardCoordinate(4, 4),
          new BoardCoordinate(4, 6),
          new BoardCoordinate(3, 7),
          new BoardCoordinate(1, 7),
          new BoardCoordinate(0, 6),
          new BoardCoordinate(0, 4),
          new BoardCoordinate(1, 3),
        ],
      );
    });

    it("Ignores pieces in path", () => {
      testKnightMovement(
        PieceColor.WHITE,
        "rnbqk2r/ppp2ppp/3p4/2b5/3PP1n1/2N2N2/PPP2PPP/R1BQKB1R b KQkq d3 0 6",
        new BoardCoordinate(2, 5),
        [
          new BoardCoordinate(4, 4),
          new BoardCoordinate(4, 6),
          new BoardCoordinate(3, 7),
          new BoardCoordinate(0, 6),
          new BoardCoordinate(1, 3),
        ],
      );
    });

    it("Include coordinates occupied by enemy", () => {
      testKnightMovement(
        PieceColor.BLACK,
        "rnbqk2r/ppp2ppp/1b1p1n2/8/2BPP3/2N2N1P/PPP2PP1/R1BQK2R b KQkq - 2 8",
        new BoardCoordinate(5, 5),
        [
          new BoardCoordinate(6, 3),
          new BoardCoordinate(7, 6),
          new BoardCoordinate(4, 7),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(3, 4),
          new BoardCoordinate(4, 3),
        ],
      );
    });

    it("Ignores coordinates outside of the board", () => {
      testKnightMovement(
        PieceColor.BLACK,
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        new BoardCoordinate(7, 6),
        [
          new BoardCoordinate(6, 4),
          new BoardCoordinate(5, 5),
          new BoardCoordinate(5, 7),
        ],
      );
    });
  });
});
