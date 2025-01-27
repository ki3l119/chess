import { Direction } from "../board";
import { SlidingPiece } from "./sliding-piece";

export class Rook extends SlidingPiece {
  getDirections(): Direction[] {
    return [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];
  }
}
