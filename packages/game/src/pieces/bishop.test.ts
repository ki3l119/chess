import { describe, it } from "@jest/globals";

import { testPieceMovement } from "../../.jest/piece-utils";
import { BoardCoordinate } from "../board";
import { PieceColor } from "./piece";
import { Bishop } from "./bishop";

function testBishopMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const bishop = new Bishop(color);
  testPieceMovement(bishop, gameFEN, origin, expected);
}

describe("Bishop", () => {
  describe("generatePseudoLegalMoves", () => {
    it("Moves diagonally until end of the board", () => {
      testBishopMovement(
        PieceColor.WHITE,
        "6Q1/8/5K2/8/6B1/2kPp3/8/8 w - - 0 48",
        new BoardCoordinate(3, 6),
        [
          new BoardCoordinate(7, 2),
          new BoardCoordinate(6, 3),
          new BoardCoordinate(5, 4),
          new BoardCoordinate(4, 5),
          new BoardCoordinate(2, 7),
          new BoardCoordinate(4, 7),
          new BoardCoordinate(2, 5),
          new BoardCoordinate(1, 4),
          new BoardCoordinate(0, 3),
        ],
      );
    });

    it("Includes coordinates with opponent pieces", () => {
      testBishopMovement(
        PieceColor.WHITE,
        "4r1kr/Q5pp/2pbp2q/8/8/2NP4/PPP2PPP/R1B2RK1 w - - 1 15",
        new BoardCoordinate(0, 2),
        [
          new BoardCoordinate(1, 3),
          new BoardCoordinate(2, 4),
          new BoardCoordinate(3, 5),
          new BoardCoordinate(4, 6),
          new BoardCoordinate(5, 7),
        ],
      );
    });
  });
});
