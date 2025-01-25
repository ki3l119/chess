import { BoardCoordinate } from "../board";
import type { GameState } from "../types";
import { Piece } from "./piece";

export class Queen extends Piece {
  generatePseudoLegalMoves(
    gameState: GameState,
    origin: BoardCoordinate,
  ): BoardCoordinate[] {
    throw new Error("Method not implemented.");
  }
}
