import type { BoardCoordinate } from "../models/board";

/**
 * Converts the algebraic notation of the board square to a Square object.
 *
 * Returns null for those with invalid format.
 */
export function parseSquare(algebraicNotation: string): BoardCoordinate | null {
  if (algebraicNotation.length !== 2) {
    return null;
  }

  const [file, rank] = algebraicNotation.split("");

  const fileCharCode = file.charCodeAt(0);

  if (fileCharCode < 97 || fileCharCode > 104) {
    return null;
  }

  const rankNumber = parseInt(rank) - 1;

  if (isNaN(rankNumber) || rankNumber > 7) {
    return null;
  }

  return {
    file: fileCharCode % 97,
    rank: rankNumber,
  };
}
