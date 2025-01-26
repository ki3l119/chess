import { describe, it } from "@jest/globals";

import { BoardCoordinate } from "../board";
import { PieceColor } from "./piece";
import { Rook } from "./rook";
import { testPieceMovement } from "../../.jest/piece-utils";

function testRookMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const rook = new Rook(color);
  testPieceMovement(rook, gameFEN, origin, expected);
}

describe("Rook", () => {
  describe("generatePseudoLegalMoves", () => {
    it("Moves straight until end of the board", () => {
      testRookMovement(
        PieceColor.WHITE,
        "8/6R1/3N4/7k/4Q2p/3P1P1P/1PP4K/8 w - - 5 41",
        new BoardCoordinate(6, 6),
        [
          new BoardCoordinate(6, 0),
          new BoardCoordinate(6, 1),
          new BoardCoordinate(6, 2),
          new BoardCoordinate(6, 3),
          new BoardCoordinate(6, 4),
          new BoardCoordinate(6, 5),
          new BoardCoordinate(7, 6),
          new BoardCoordinate(6, 7),
          new BoardCoordinate(5, 6),
          new BoardCoordinate(4, 6),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(2, 6),
          new BoardCoordinate(1, 6),
          new BoardCoordinate(0, 6),
        ],
      );
    });

    it("Includes coordinates occupied by opponent pieces", () => {
      testRookMovement(
        PieceColor.BLACK,
        "7r/5rkp/2p1Q2p/8/4N3/3P4/PPP2PPK/R3R3 b - - 4 20",
        new BoardCoordinate(6, 5),
        [
          new BoardCoordinate(6, 0),
          new BoardCoordinate(6, 1),
          new BoardCoordinate(6, 2),
          new BoardCoordinate(6, 3),
          new BoardCoordinate(6, 4),
          new BoardCoordinate(7, 5),
          new BoardCoordinate(5, 5),
          new BoardCoordinate(4, 5),
          new BoardCoordinate(3, 5),
          new BoardCoordinate(2, 5),
          new BoardCoordinate(1, 5),
        ],
      );
    });
  });
});
