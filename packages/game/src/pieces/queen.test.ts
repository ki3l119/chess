import { describe, it } from "@jest/globals";

import { BoardCoordinate } from "../board";
import { PieceColor } from "./piece";
import { Queen } from "./queen";
import { testPieceMovement } from "../../.jest/piece-utils";

function testQueenMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const queen = new Queen(color);
  testPieceMovement(queen, gameFEN, origin, expected);
}

describe("Queen", () => {
  describe("generatePseudoLegalMoves", () => {
    it("Moves straight and diagonally from current position", () => {
      testQueenMovement(
        PieceColor.WHITE,
        "7k/8/4Q3/RN6/7P/3P1P2/1PP4K/8 w - - 1 47",
        new BoardCoordinate(5, 4),
        [
          new BoardCoordinate(5, 0),
          new BoardCoordinate(5, 1),
          new BoardCoordinate(5, 2),
          new BoardCoordinate(5, 3),
          new BoardCoordinate(5, 5),
          new BoardCoordinate(5, 6),
          new BoardCoordinate(5, 7),
          new BoardCoordinate(6, 4),
          new BoardCoordinate(7, 4),
          new BoardCoordinate(4, 4),
          new BoardCoordinate(3, 4),
          new BoardCoordinate(2, 4),
          new BoardCoordinate(1, 4),
          new BoardCoordinate(0, 4),
          new BoardCoordinate(6, 3),
          new BoardCoordinate(7, 2),
          new BoardCoordinate(4, 5),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(2, 7),
          new BoardCoordinate(4, 3),
          new BoardCoordinate(3, 2),
          new BoardCoordinate(2, 1),
          new BoardCoordinate(1, 0),
          new BoardCoordinate(6, 5),
          new BoardCoordinate(7, 6),
        ],
      );
    });

    it("Should include coordinates that have opponent pieces", () => {
      testQueenMovement(
        PieceColor.BLACK,
        "rnb1kb1r/pp2pppp/2p1qn2/8/8/2N2N2/PPPPBPPP/R1BQ1RK1 b kq - 5 6",
        new BoardCoordinate(5, 4),
        [
          new BoardCoordinate(6, 3),
          new BoardCoordinate(5, 3),
          new BoardCoordinate(4, 3),
          new BoardCoordinate(3, 2),
          new BoardCoordinate(2, 1),
          new BoardCoordinate(1, 0),
          new BoardCoordinate(4, 4),
          new BoardCoordinate(3, 4),
          new BoardCoordinate(2, 4),
          new BoardCoordinate(1, 4),
          new BoardCoordinate(4, 5),
          new BoardCoordinate(3, 6),
          new BoardCoordinate(2, 7),
        ],
      );
    });
  });
});
