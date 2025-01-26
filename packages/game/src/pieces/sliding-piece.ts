import { GameState } from "../types";
import { Direction, type BoardCoordinate } from "../board";
import { Piece } from "./piece";

export abstract class SlidingPiece extends Piece {
  /**
   * @returns A list of all direction the piece can move to.
   */
  protected abstract getDirections(): Direction[];

  generatePseudoLegalMoves(
    gameState: GameState,
    coordinate: BoardCoordinate,
  ): BoardCoordinate[] {
    const directions = this.getDirections();

    const oppositeColor = this.getOppositeColor();

    const destinationCoordinates: BoardCoordinate[] = [];
    for (const direction of directions) {
      for (const destinationCoordinate of gameState.board.traverseDirection(
        coordinate,
        direction,
      )) {
        const piece = gameState.board.getPiece(destinationCoordinate);
        if (piece) {
          if (piece.color === oppositeColor) {
            destinationCoordinates.push(destinationCoordinate);
          }
          break;
        } else {
          destinationCoordinates.push(destinationCoordinate);
        }
      }
    }

    return destinationCoordinates;
  }
}
