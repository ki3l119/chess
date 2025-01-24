import { Board, BoardCoordinate } from "../board";
import { Piece } from "./piece";

export class Queen extends Piece {
  generatePseudoLegalMoves(
    board: Board,
    origin: BoardCoordinate,
  ): BoardCoordinate[] {
    throw new Error("Method not implemented.");
  }
}
