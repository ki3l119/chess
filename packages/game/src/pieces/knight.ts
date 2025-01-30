import type { BoardCoordinateOffset } from "../board";
import { OffsetPiece } from "./offset-piece";

export class Knight extends OffsetPiece {
  static readonly offsets: readonly BoardCoordinateOffset[] = [
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

  protected getOffsets(): BoardCoordinateOffset[] {
    return [...Knight.offsets];
  }
}
