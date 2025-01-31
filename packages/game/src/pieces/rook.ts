import { Direction } from "../board";
import { PieceColor } from "./piece";
import { SlidingPiece } from "./sliding-piece";

export class Rook extends SlidingPiece {
  getDirections(): Direction[] {
    return [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];
  }

  getFENString(): string {
    return this.color === PieceColor.WHITE ? "R" : "r";
  }
}
