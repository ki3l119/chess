import { Direction } from "../board";
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
}
