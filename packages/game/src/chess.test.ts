import { describe, it, expect } from "@jest/globals";

import { parseFEN, startingBoardFENString } from "./utils/fen-parser";
import {
  Chess,
  GameEndReason,
  GameResult,
  MoveOptions,
  PawnPromotionPieceName,
} from "./chess";
import { BoardCoordinate, Move } from "./board";
import { InvalidMoveException } from "./exceptions";
import { FENPieceName, PieceColor } from "./pieces";

function testChessMove(
  initialGameStateFEN: string,
  move: Move,
  expectedGameStateFEN: string,
  options: MoveOptions = {},
) {
  const initialGameState = parseFEN(initialGameStateFEN);
  const chess = new Chess(initialGameState);
  const expectedState = parseFEN(expectedGameStateFEN);
  chess.move(move, options);
  expect(chess.getGameState()).toStrictEqual(expectedState);
  expect(chess.isOngoing()).toBe(true);
}

function testGameResult(
  initialGameStateFEN: string,
  move: Move,
  expectedGameStateFEN: string,
  result: GameResult,
) {
  const initialGameState = parseFEN(initialGameStateFEN);
  const chess = new Chess(initialGameState);
  const expectedState = parseFEN(expectedGameStateFEN);
  chess.move(move);
  expect(chess.getGameState()).toStrictEqual(expectedState);
  expect(chess.getResult()).toStrictEqual(result);
}

function testInvalidChessMove(initialGameStateFEN: string, move: Move) {
  const initialGameState = parseFEN(initialGameStateFEN);
  const chess = new Chess(initialGameState);
  expect(() => {
    chess.move(move);
  }).toThrow(InvalidMoveException);
  expect(chess.getGameState()).toStrictEqual(initialGameState);
  expect(chess.isOngoing()).toBe(true);
}

describe("Chess", () => {
  describe("move", () => {
    it("Updates game state on valid move", () => {
      testChessMove(
        "rnb1kbnr/pppp1ppp/5q2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        {
          from: new BoardCoordinate(0, 5),
          to: new BoardCoordinate(3, 2),
        },
        "rnb1kbnr/pppp1ppp/5q2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      );
    });

    it("Removes opposing piece on capture", () => {
      testChessMove(
        "Nnbk3r/pp3p1p/3p1nq1/2b1p3/2B1P3/3PBQ2/PPP2PPP/R4RK1 b - - 1 11",
        {
          from: new BoardCoordinate(4, 2),
          to: new BoardCoordinate(2, 4),
        },
        "Nnbk3r/pp3p1p/3p1nq1/4p3/2B1P3/3PbQ2/PPP2PPP/R4RK1 w - - 0 12",
      );
    });

    it("Throws exception on invalid move", () => {
      testInvalidChessMove(
        "rnb1kbnr/pppp1ppp/5q2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        {
          from: new BoardCoordinate(1, 3),
          to: new BoardCoordinate(4, 3),
        },
      );
    });

    it("Throws exception on moving a pinned piece", () => {
      testInvalidChessMove(
        "r1bqk2r/ppp2ppp/2n2n2/3p2B1/1b1P4/2Q5/PP2PPPP/RN2KBNR w KQkq - 4 7",
        {
          from: new BoardCoordinate(2, 2),
          to: new BoardCoordinate(2, 4),
        },
      );
    });

    it("Allows king to move out of check", () => {
      testChessMove(
        "4r1k1/1pp3p1/p5rp/4p3/1P1q4/P2P1P1P/3Q2P1/R3R1K1 w - - 0 23",
        {
          from: new BoardCoordinate(0, 6),
          to: new BoardCoordinate(0, 7),
        },
        "4r1k1/1pp3p1/p5rp/4p3/1P1q4/P2P1P1P/3Q2P1/R3R2K b - - 1 23",
      );
    });

    it("Allows other piece to intercept check", () => {
      testChessMove(
        "5rkr/7p/2p1Q2p/8/8/2NP4/PPP2PPK/R4R2 b - - 0 18",
        {
          from: new BoardCoordinate(7, 5),
          to: new BoardCoordinate(6, 5),
        },
        "6kr/5r1p/2p1Q2p/8/8/2NP4/PPP2PPK/R4R2 w - - 1 19",
      );
    });

    it("Allows capture of opponent piece attacking king", () => {
      testChessMove(
        "rn2k2r/pp1b1ppp/2p1pN2/3q4/3Pn3/2B5/PPP2PPP/R2QKB1R b KQkq - 6 10",
        {
          from: new BoardCoordinate(6, 6),
          to: new BoardCoordinate(5, 5),
        },
        "rn2k2r/pp1b1p1p/2p1pp2/3q4/3Pn3/2B5/PPP2PPP/R2QKB1R w KQkq - 0 11",
      );
    });

    it("Prevents moves that does not move king out of check", () => {
      testInvalidChessMove("8/P7/3N4/6k1/4QP1p/3P3P/1PP4K/8 b - - 0 38", {
        from: new BoardCoordinate(4, 6),
        to: new BoardCoordinate(3, 5),
      });
    });

    it.each([
      [
        "rnb1kb1r/pp2pppp/2p1qn2/8/8/2N2N2/PPPPBPPP/R1BQK2R w KQkq - 4 6",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 6),
        },
        "rnb1kb1r/pp2pppp/2p1qn2/8/8/2N2N2/PPPPBPPP/R1BQ1RK1 b kq - 5 6",
      ],
      [
        "r3kb1r/p2bpppp/2p1qn2/1pn3N1/5B2/2NP4/PPPQBPPP/R3K2R w KQkq - 4 10",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 2),
        },
        "r3kb1r/p2bpppp/2p1qn2/1pn3N1/5B2/2NP4/PPPQBPPP/2KR3R b kq - 5 10",
      ],
      [
        "rnb1k2r/pp2ppbp/2p1qnp1/8/5B2/2NP1N2/PPP1BPPP/R2Q1RK1 b kq - 2 8",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 6),
        },
        "rnb2rk1/pp2ppbp/2p1qnp1/8/5B2/2NP1N2/PPP1BPPP/R2Q1RK1 w - - 3 9",
      ],
      [
        "r3kb1r/pp1npppp/2p4q/6N1/6Q1/P1N5/1PPP1PPP/R1B2RK1 b kq - 0 10",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 2),
        },
        "2kr1b1r/pp1npppp/2p4q/6N1/6Q1/P1N5/1PPP1PPP/R1B2RK1 w - - 1 11",
      ],
    ])("Allows castling moves if valid (%#)", testChessMove);

    it.each([
      [
        "r1bqr1k1/p1p2p1p/2p5/2b1Pp2/2Q5/8/PPP1B1PP/RN2K2R w KQ - 0 14",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 6),
        },
      ],
      [
        "r1bq2k1/p1p2p1p/1bp2P2/8/8/8/PPP1N1PP/R3KB1R w KQ - 1 15",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 2),
        },
      ],
      [
        "r1bqk2r/p1p1bppp/np1p1n2/1B2p3/4P3/2NP1N2/PPP2PPP/R1BQ1RK1 b kq - 3 7",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 6),
        },
      ],
      [
        "r3kb1r/pp1npNpp/2p4q/8/6Q1/2N5/PPPP1PPP/R1B2RK1 b kq - 0 10",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 2),
        },
      ],
    ])(
      "Prevents castling if an opposing piece threatens any square along the castling path (%#)",
      testInvalidChessMove,
    );

    it.each([
      [
        "rn1qkbnr/ppp2ppp/3p4/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w Qkq - 6 6",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 6),
        },
      ],
      [
        "r2q1rk1/ppp1bppp/2np1n2/4p1B1/2B1P1b1/2NP1N2/PPPQ1PPP/R3K2R w K - 11 10",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(0, 2),
        },
      ],
      [
        "r1bqk2r/p1p1bppp/2pp1n2/8/4PP1B/3Q4/PPP3PP/RN2KB1R b KQq - 4 10",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 6),
        },
      ],
      [
        "r3kb1r/pbppqppp/2p2n2/8/4PB2/2N5/PPP1QPPP/R3KB1R b KQk - 9 10",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 2),
        },
      ],
    ])(
      "Prevents castling if the corresponding castling right is set to false (%#)",
      testInvalidChessMove,
    );

    it.each([
      [
        "rn1qkbnr/ppp2ppp/3p4/4p3/2B1P3/5N1b/PPPP1PP1/RNBQK2R w KQkq - 0 5",
        {
          from: new BoardCoordinate(0, 7),
          to: new BoardCoordinate(2, 7),
        },
        "rn1qkbnr/ppp2ppp/3p4/4p3/2B1P3/5N1R/PPPP1PP1/RNBQK3 b Qkq - 0 5",
      ],
      [
        "r4rk1/pppqbppp/2np1n2/4p3/P1B1P1b1/2NP1N2/1PPBQPPP/R3K2R w KQ - 1 9",
        {
          from: new BoardCoordinate(0, 0),
          to: new BoardCoordinate(2, 0),
        },
        "r4rk1/pppqbppp/2np1n2/4p3/P1B1P1b1/R1NP1N2/1PPBQPPP/4K2R b K - 2 9",
      ],
      [
        "r3k2r/ppp1bppp/3p1n2/4p3/2BnP1b1/3P1N2/PPP2PPP/R1BQR1K1 b kq - 1 9",
        {
          from: new BoardCoordinate(7, 7),
          to: new BoardCoordinate(7, 5),
        },
        "r3kr2/ppp1bppp/3p1n2/4p3/2BnP1b1/3P1N2/PPP2PPP/R1BQR1K1 w q - 2 10",
      ],
      [
        "r3kbnr/ppp2ppp/2np1q2/4p3/2B1P1b1/2NP1N2/PPP2PPP/R1BQ1RK1 b kq - 0 6",
        {
          from: new BoardCoordinate(7, 0),
          to: new BoardCoordinate(7, 3),
        },
        "3rkbnr/ppp2ppp/2np1q2/4p3/2B1P1b1/2NP1N2/PPP2PPP/R1BQ1RK1 w k - 1 7",
      ],
    ])(
      "Removes correponding castling right on rook movement (%#)",
      testChessMove,
    );

    it.each([
      [
        "r1bqkbnr/pppp1pp1/2n4p/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 4",
        {
          from: new BoardCoordinate(0, 4),
          to: new BoardCoordinate(1, 4),
        },
        "r1bqkbnr/pppp1pp1/2n4p/4p3/4P3/2N2N2/PPPPKPPP/R1BQ1B1R b kq - 1 4",
      ],
      [
        "r1bqk2r/ppp1bpp1/3p1n1p/8/2BQPB2/2N5/PPP2PPP/R4RK1 b kq - 5 9",
        {
          from: new BoardCoordinate(7, 4),
          to: new BoardCoordinate(7, 5),
        },
        "r1bq1k1r/ppp1bpp1/3p1n1p/8/2BQPB2/2N5/PPP2PPP/R4RK1 w - - 6 10",
      ],
    ])(
      "Removes corresponding castling rights once king is moved (%#)",
      testChessMove,
    );

    it.each([
      [
        "rnbqkbnr/pp2p1pp/2p5/3pPp2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq f6 0 4",
        {
          from: new BoardCoordinate(4, 4),
          to: new BoardCoordinate(5, 5),
        },
        "rnbqkbnr/pp2p1pp/2p2P2/3p4/8/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 4",
      ],
      [
        "rnbqkbnr/pp2pppp/2p5/4P3/2Pp4/5N2/PP1P1PPP/RNBQKB1R b KQkq c3 0 4",
        {
          from: new BoardCoordinate(3, 3),
          to: new BoardCoordinate(2, 2),
        },
        "rnbqkbnr/pp2pppp/2p5/4P3/8/2p2N2/PP1P1PPP/RNBQKB1R w KQkq - 0 5",
      ],
    ])("En passant target is removed from the board when taken", testChessMove);

    it.each([
      [
        startingBoardFENString,
        {
          from: new BoardCoordinate(1, 4),
          to: new BoardCoordinate(3, 4),
        },
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      ],
      [
        "rnbqkbnr/pp1ppppp/2p5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        {
          from: new BoardCoordinate(6, 3),
          to: new BoardCoordinate(4, 3),
        },
        "rnbqkbnr/pp2pppp/2p5/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq d6 0 3",
      ],
    ])(
      "En passant target updated when pawn takes 2 steps forward",
      testChessMove,
    );

    it.each([
      [
        "1n3n1k/pp3Qp1/3P4/1N4N1/1PB4K/P7/8/R7 w - - 1 34",
        {
          from: new BoardCoordinate(6, 5),
          to: new BoardCoordinate(7, 5),
        },
        "1n3Q1k/pp4p1/3P4/1N4N1/1PB4K/P7/8/R7 b - - 0 34",
        {
          winner: PieceColor.WHITE,
          reason: GameEndReason.CHECKMATE,
        },
      ],
      [
        "4k1r1/R4p1p/5p2/1P1q4/1b1N2P1/4P2P/2r2P2/5K2 b - - 1 25",
        {
          from: new BoardCoordinate(4, 3),
          to: new BoardCoordinate(0, 7),
        },
        "4k1r1/R4p1p/5p2/1P6/1b1N2P1/4P2P/2r2P2/5K1q w - - 2 26",
        {
          winner: PieceColor.BLACK,
          reason: GameEndReason.CHECKMATE,
        },
      ],
    ])("Sets game status to winning color on checkmate", testGameResult);

    it("Sets game status to stalemate if reached", () => {
      testGameResult(
        "7k/8/4Q3/R7/4N2p/3P1P1P/1PP4K/8 w - - 7 42",
        {
          from: new BoardCoordinate(4, 0),
          to: new BoardCoordinate(6, 0),
        },
        "7k/R7/4Q3/8/4N2p/3P1P1P/1PP4K/8 b - - 8 42",
        {
          winner: null,
          reason: GameEndReason.STALEMATE,
        },
      );
    });

    it("Sets game status to draw if 50-move rule is reached", () => {
      testGameResult(
        "6R1/7k/8/8/1r3B2/5K2/8/8 w - - 99 119",
        {
          from: new BoardCoordinate(7, 6),
          to: new BoardCoordinate(4, 6),
        },
        "8/7k/8/6R1/1r3B2/5K2/8/8 b - - 100 119",
        {
          winner: null,
          reason: GameEndReason.FIFTY_MOVE_RULE,
        },
      );
    });

    it.each([
      {
        from: new BoardCoordinate(-1, 4),
        to: new BoardCoordinate(3, 4),
      },
      {
        from: new BoardCoordinate(0, 4),
        to: new BoardCoordinate(3, 8),
      },
    ])(
      "Throws exception if the provided coordinates is out of bounds.",
      (move) => {
        testInvalidChessMove(startingBoardFENString, move);
      },
    );

    it.each([
      ["R", "R7/8/3N4/6k1/4Q2p/3P1P1P/1PP4K/8 b - - 0 38"],
      ["Q", "Q7/8/3N4/6k1/4Q2p/3P1P1P/1PP4K/8 b - - 0 38"],
      ["B", "B7/8/3N4/6k1/4Q2p/3P1P1P/1PP4K/8 b - - 0 38"],
      ["N", "N7/8/3N4/6k1/4Q2p/3P1P1P/1PP4K/8 b - - 0 38"],
    ])(
      "Promotes white pawn to specified piece (%#)",
      (targetPiece: string, expectedGameStateFEN: string) => {
        testChessMove(
          "8/P7/3N4/6k1/4Q2p/3P1P1P/1PP4K/8 w - - 1 38",
          {
            from: new BoardCoordinate(6, 0),
            to: new BoardCoordinate(7, 0),
          },
          expectedGameStateFEN,
          {
            pawnPromotionPiece: targetPiece as PawnPromotionPieceName,
          },
        );
      },
    );

    it.each([
      ["R", "5r2/5rkp/4Q3/6Np/3P4/5P2/P1PR2PK/1rR5 w - - 0 27"],
      ["B", "5r2/5rkp/4Q3/6Np/3P4/5P2/P1PR2PK/1bR5 w - - 0 27"],
      ["N", "5r2/5rkp/4Q3/6Np/3P4/5P2/P1PR2PK/1nR5 w - - 0 27"],
      ["Q", "5r2/5rkp/4Q3/6Np/3P4/5P2/P1PR2PK/1qR5 w - - 0 27"],
    ])(
      "Promotes black pawn to specified piece (%#)",
      (targetPiece: string, expectedGameStateFEN: string) => {
        testChessMove(
          "5r2/5rkp/4Q3/6Np/3P4/5P2/PpPR2PK/2R5 b - - 1 26",
          {
            from: new BoardCoordinate(1, 1),
            to: new BoardCoordinate(0, 1),
          },
          expectedGameStateFEN,
          {
            pawnPromotionPiece: targetPiece as PawnPromotionPieceName,
          },
        );
      },
    );
  });
});
