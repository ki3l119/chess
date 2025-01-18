import type { Piece } from "./piece";

export type BoardElement = Piece | null;

/**
 * 8x8 array where each row represents a rank from the chess board. The ranks
 * are ordered from 1 to 8, and the elements in each rank are ordered from
 * file A to H.
 */
export type Board = BoardElement[][];

export type BoardSquare = {
  // 0-based index of the rank
  rank: number;

  /**
   * a = 0, b = 1, ..., h=7
   */
  file: number;
};
