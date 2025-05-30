import type { BoardCoordinateOffset } from "../board";
import { OffsetPiece } from "./offset-piece";
import { PieceColor } from "./piece";

export class King extends OffsetPiece {
  static readonly offsets: readonly BoardCoordinateOffset[] = [
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

  protected getOffsets(): BoardCoordinateOffset[] {
    return [...King.offsets];
  }

  getFENString(): string {
    return this.color === PieceColor.WHITE ? "K" : "k";
  }
}
