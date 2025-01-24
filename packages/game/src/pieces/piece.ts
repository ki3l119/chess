export enum PieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export abstract class Piece {
  constructor(readonly color: PieceColor) {}

  getOppositeColor() {
    return this.color === PieceColor.WHITE
      ? PieceColor.BLACK
      : PieceColor.WHITE;
  }
}
