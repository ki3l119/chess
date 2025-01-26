import { Direction } from "../board";
import { SlidingPiece } from "./sliding-piece";

export class Queen extends SlidingPiece {
  protected getDirections(): Direction[] {
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
}
