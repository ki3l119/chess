import type { BoardCoordinateOffset } from "../board";
import { OffsetPiece } from "./offset-piece";

export class King extends OffsetPiece {
  getOffsets(): BoardCoordinateOffset[] {
    return [
      {
        rank: 1,
        file: 0,
      },
      {
        rank: 1,
        file: 1,
      },
      {
        rank: 0,
        file: 1,
      },
      {
        rank: -1,
        file: 1,
      },
      {
        rank: -1,
        file: 0,
      },
      {
        rank: -1,
        file: -1,
      },
      {
        rank: 0,
        file: -1,
      },
      {
        rank: 1,
        file: -1,
      },
    ];
  }
}
