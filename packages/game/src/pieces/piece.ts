import type { BoardCoordinate } from "../board";
import type { GameState } from "../types";

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
   * @param gameState - The current state of the chess game.
   * @param origin - Where the piece currently resides.
   * @returns A list of destination coordinates.
   */
  abstract generatePseudoLegalMoves(
    gameState: GameState,
    origin: BoardCoordinate,
  ): BoardCoordinate[];

  getOppositeColor() {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }

  abstract getFENString(): string;
}
