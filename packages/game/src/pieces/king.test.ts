import { describe, it } from "@jest/globals";

import { BoardCoordinate } from "../board";
import { PieceColor } from "./piece";
import { King } from "./king";
import { testPieceMovement } from "../../.jest/piece-utils";

function testKingMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const king = new King(color);
  testPieceMovement(king, gameFEN, origin, expected);
}

describe("King", () => {
  describe("generatePseudoLegalMoves", () => {
    it("Moves 1 step from current position", () => {
      testKingMovement(
        PieceColor.WHITE,
        "4r1k1/pp3pp1/n5n1/1N1P2Np/1PB5/P5K1/8/R3Q3 w - - 0 30",
        new BoardCoordinate(2, 6),
        [
          new BoardCoordinate(3, 5),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(3, 7),
          new BoardCoordinate(2, 7),
          new BoardCoordinate(1, 7),
          new BoardCoordinate(1, 6),
          new BoardCoordinate(1, 5),
          new BoardCoordinate(2, 5),
        ],
      );
    });

    it("Includes coordinates occupied by opponent pieces", () => {
      testKingMovement(
        PieceColor.WHITE,
        "4Qnk1/p4pp1/np1P4/1N4N1/1PB3Kp/P7/8/R7 w - - 0 33",
        new BoardCoordinate(3, 6),
        [
          new BoardCoordinate(4, 5),
          new BoardCoordinate(4, 7),
          new BoardCoordinate(3, 7),
          new BoardCoordinate(2, 7),
          new BoardCoordinate(2, 6),
          new BoardCoordinate(2, 5),
          new BoardCoordinate(3, 5),
        ],
      );
    });

    it("Does not include coordinates outside of the board", () => {
      testKingMovement(
        PieceColor.BLACK,
        "rnbq1rk1/ppp2ppp/1b1p1n2/8/2BPP3/2N2N1P/PPP2PP1/R1BQ1RK1 b - - 4 9",
        new BoardCoordinate(7, 6),
        [new BoardCoordinate(7, 7)],
      );
    });
  });
});
