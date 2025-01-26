import type { GameState } from "../types";
import type { BoardCoordinate, BoardCoordinateOffset, Board } from "../board";
import { Piece } from "./piece";

/**
 * Pieces whose movements are dictated by a fixed offset from their original
 * position.
 */
export abstract class OffsetPiece extends Piece {
  /**
   * @returns A list of offsets the piece can move to from its current position.
   */
  protected abstract getOffsets(): BoardCoordinateOffset[];

  generatePseudoLegalMoves(
    gameState: GameState,
    origin: BoardCoordinate,
  ): BoardCoordinate[] {
    const destinationOffsets = this.getOffsets();

    const destinationCoordinates: BoardCoordinate[] = [];

    const oppositeColor = this.getOppositeColor();

    for (const destinationCoordinate of gameState.board.traverseOffsets(
      origin,
      destinationOffsets,
    )) {
      const piece = gameState.board.getPiece(destinationCoordinate);
      if (!piece || piece.color === oppositeColor) {
        destinationCoordinates.push(destinationCoordinate);
      }
    }

    return destinationCoordinates;
  }
}
