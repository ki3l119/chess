import { Direction } from "../board";
import { PieceColor } from "./piece";
import { SlidingPiece } from "./sliding-piece";

export class Bishop extends SlidingPiece {
  getDirections(): Direction[] {
    return [
      Direction.NORTH_EAST,
      Direction.NORTH_WEST,
      Direction.SOUTH_EAST,
      Direction.SOUTH_WEST,
    ];
  }

  getFENString(): string {
    return this.color === PieceColor.WHITE ? "B" : "b";
  }
}
