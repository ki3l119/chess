import { BoardCoordinate, Direction } from "../board";
import type { GameState } from "../types";
import { Piece, PieceColor } from "./piece";

export class Pawn extends Piece {
  generatePseudoLegalMoves(
    gameState: GameState,
    origin: BoardCoordinate,
  ): BoardCoordinate[] {
    const destinationCoordinates: BoardCoordinate[] = [];

    const diagonalAttackOffsetRank = this.color === PieceColor.WHITE ? 1 : -1;
    const oppositeColor = this.getOppositeColor();

    // Diagonal attack
    for (const coordinate of gameState.board.traverseOffsets(origin, [
      {
        rank: diagonalAttackOffsetRank,
        file: 1,
      },
      {
        rank: diagonalAttackOffsetRank,
        file: -1,
      },
    ])) {
      const piece = gameState.board.getPiece(coordinate);
      if (piece && piece.color === oppositeColor) {
        destinationCoordinates.push(coordinate);
      }
    }

    // Forward movement
    const direction =
      this.color === PieceColor.WHITE ? Direction.NORTH : Direction.SOUTH;
    const startingRank = this.color === PieceColor.WHITE ? 1 : 6;
    for (const forwardSquare of gameState.board.traverseDirection(
      origin,
      direction,
      {
        maxSteps: startingRank === origin.rank ? 2 : 1,
      },
    )) {
      const piece = gameState.board.getPiece(forwardSquare);
      if (piece) {
        break;
      }
      destinationCoordinates.push(forwardSquare);
    }

    // En passant
    if (gameState.enPassantTarget !== null) {
      for (const coordinate of gameState.board.traverseOffsets(
        gameState.enPassantTarget,
        [
          {
            rank: -diagonalAttackOffsetRank,
            file: 1,
          },
          {
            rank: -diagonalAttackOffsetRank,
            file: -1,
          },
        ],
      )) {
        if (coordinate.isEqual(origin)) {
          destinationCoordinates.push(gameState.enPassantTarget);
          break;
        }
      }
    }

    return destinationCoordinates;
  }
}
