import { describe, it, expect } from "@jest/globals";
import { PieceColor } from "./piece";
import { parseFEN, startingBoardFENString } from "../utils/fen-parser";
import { BoardCoordinate } from "../board";
import { Pawn } from "./pawn";

function testPawnMovement(
  color: PieceColor,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const gameState = parseFEN(gameFEN);
  const pawn = new Pawn(color);
  const actual = pawn.generatePseudoLegalMoves(gameState, origin);
  const sortFunction = (a: BoardCoordinate, b: BoardCoordinate) =>
    a.rank - b.rank || a.file - b.file;
  expect([...actual].sort(sortFunction)).toStrictEqual(
    [...expected].sort(sortFunction),
  );
}

describe("Pawn", () => {
  describe("generatePseudoLegalMove", () => {
    it.each([
      [
        PieceColor.BLACK,
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        new BoardCoordinate(6, 3),
        [new BoardCoordinate(5, 3), new BoardCoordinate(4, 3)],
      ],
      [
        PieceColor.WHITE,
        startingBoardFENString,
        new BoardCoordinate(1, 4),
        [new BoardCoordinate(2, 4), new BoardCoordinate(3, 4)],
      ],
    ])("A maximum of two forward steps on first turn (%s)", testPawnMovement);

    it.each([
      [
        PieceColor.BLACK,
        "r1bqkbnr/pppp1pp1/2n4p/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq d3 0 4",
        new BoardCoordinate(5, 7),
        [new BoardCoordinate(4, 7)],
      ],
      [
        PieceColor.WHITE,
        "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
        new BoardCoordinate(3, 4),
        [new BoardCoordinate(4, 4)],
      ],
    ])(
      "A maximum of 1 forward step on succeeding turns (%s)",
      testPawnMovement,
    );

    it.each([
      [
        PieceColor.BLACK,
        "r1bqkb1r/p1pp1ppp/2p2n2/8/4P3/3B4/PPP2PPP/RNBQK2R b KQkq - 1 6",
        new BoardCoordinate(6, 2),
        [],
      ],
      [
        PieceColor.WHITE,
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
        new BoardCoordinate(3, 4),
        [],
      ],
    ])("Stops forward movement when blocked (%s)", testPawnMovement);

    it.each([
      [
        PieceColor.BLACK,
        "r1bq1rk1/p1p1bppp/np1p1n2/4p3/2BPP3/2N1BN1P/PPP2PP1/R2QR1K1 b - - 0 10",
        new BoardCoordinate(4, 4),
        [new BoardCoordinate(3, 3)],
      ],
      [
        PieceColor.WHITE,
        "Nnbk2nr/pp1p1p1p/6q1/2b1p3/2B1P3/5p2/PPPP1PPP/R1BQ1RK1 w - - 0 9",
        new BoardCoordinate(1, 6),
        [
          new BoardCoordinate(2, 5),
          new BoardCoordinate(2, 6),
          new BoardCoordinate(3, 6),
        ],
      ],
    ])("Adds diagonal attack if there is enemy piece (%s)", testPawnMovement);

    it.each([
      [
        PieceColor.BLACK,
        "7k/8/8/2p5/PpP5/1p6/1P6/4K3 b - a3 0 1",
        new BoardCoordinate(3, 1),
        [new BoardCoordinate(2, 0)],
      ],
      [
        PieceColor.WHITE,
        "4k3/3p2p1/8/pP6/4P2P/8/8/4K3 w - a6 0 5",
        new BoardCoordinate(4, 1),
        [new BoardCoordinate(5, 1), new BoardCoordinate(5, 0)],
      ],
    ])("Includes en passant target if possible (%s)", testPawnMovement);
  });
});
