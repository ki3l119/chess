import { expect } from "@jest/globals";

import { parseFEN } from "../src/utils/fen-parser";
import { BoardCoordinate } from "../src/board";
import { Piece } from "../src/pieces";

export function testPieceMovement(
  piece: Piece,
  gameFEN: string,
  origin: BoardCoordinate,
  expected: BoardCoordinate[],
) {
  const gameState = parseFEN(gameFEN);
  const actual = piece.generatePseudoLegalMoves(gameState, origin);
  const sortFunction = (a: BoardCoordinate, b: BoardCoordinate) =>
    a.rank - b.rank || a.file - b.file;
  expect([...actual].sort(sortFunction)).toStrictEqual(
    [...expected].sort(sortFunction),
  );
}
