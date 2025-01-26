import type { BoardCoordinateOffset } from "../board";
import { OffsetPiece } from "./offset-piece";

export class Knight extends OffsetPiece {
  protected getOffsets(): BoardCoordinateOffset[] {
    return [
      {
        rank: 2,
        file: 1,
      },
      {
        rank: 1,
        file: 2,
      },
      {
        rank: -1,
        file: 2,
      },
      {
        rank: -2,
        file: 1,
      },
      {
        rank: -2,
        file: -1,
      },
      {
        rank: -1,
        file: -2,
      },
      {
        rank: 1,
        file: -2,
      },
      {
        rank: 2,
        file: -1,
      },
    ];
  }
}
