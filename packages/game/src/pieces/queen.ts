import { Direction } from "../board";
import { PieceColor } from "./piece";
import { SlidingPiece } from "./sliding-piece";

export class Queen extends SlidingPiece {
  getDirections(): Direction[] {
    return [
      Direction.NORTH,
      Direction.SOUTH,
      Direction.EAST,
      Direction.WEST,
      Direction.NORTH_EAST,
      Direction.NORTH_WEST,
      Direction.SOUTH_EAST,
      Direction.SOUTH_WEST,
    ];
  }

  getFENString(): string {
    return this.color === PieceColor.WHITE ? "Q" : "q";
  }
}
