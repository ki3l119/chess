import type { Board, BoardCoordinate } from "../board";

export enum PieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export abstract class Piece {
  constructor(readonly color: PieceColor) {}

  /**
   * Gets all possible coordinates that the piece can reach from the specified
   * origin.
   *
   * @param board - The current state of the board.
   * @param origin - Where the piece currently resides.
   * @returns A list of destination coordinates.
   */
  abstract generatePseudoLegalMoves(
    board: Board,
    origin: BoardCoordinate,
  ): BoardCoordinate[];

  getOppositeColor() {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }
}
