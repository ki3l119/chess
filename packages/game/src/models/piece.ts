export enum PieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
}

export type Piece = {
  readonly type: PieceType;
  readonly color: PieceColor;
};

export type FENPieceName =
  | "P"
  | "N"
  | "B"
  | "R"
  | "Q"
  | "K"
  | "p"
  | "n"
  | "b"
  | "r"
  | "q"
  | "k";

export const PIECES: {
  [key in FENPieceName]: Piece;
} = {
  P: { color: PieceColor.WHITE, type: PieceType.PAWN },
  N: { color: PieceColor.WHITE, type: PieceType.KNIGHT },
  B: { color: PieceColor.WHITE, type: PieceType.BISHOP },
  R: { color: PieceColor.WHITE, type: PieceType.ROOK },
  Q: { color: PieceColor.WHITE, type: PieceType.QUEEN },
  K: { color: PieceColor.WHITE, type: PieceType.KING },
  p: { color: PieceColor.BLACK, type: PieceType.PAWN },
  n: { color: PieceColor.BLACK, type: PieceType.KNIGHT },
  b: { color: PieceColor.BLACK, type: PieceType.BISHOP },
  r: { color: PieceColor.BLACK, type: PieceType.ROOK },
  q: { color: PieceColor.BLACK, type: PieceType.QUEEN },
  k: { color: PieceColor.BLACK, type: PieceType.KING },
};
