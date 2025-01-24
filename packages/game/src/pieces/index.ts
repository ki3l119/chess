import { PieceColor, Piece } from "./piece";
import { Pawn } from "./pawn";
import { Knight } from "./knight";
import { Rook } from "./rook";
import { Bishop } from "./bishop";
import { Queen } from "./queen";
import { King } from "./king";

export { PieceColor, Piece };

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
  P: new Pawn(PieceColor.WHITE),
  N: new Knight(PieceColor.WHITE),
  B: new Bishop(PieceColor.WHITE),
  R: new Rook(PieceColor.WHITE),
  Q: new Queen(PieceColor.WHITE),
  K: new King(PieceColor.WHITE),
  p: new Pawn(PieceColor.BLACK),
  n: new Knight(PieceColor.BLACK),
  b: new Bishop(PieceColor.BLACK),
  r: new Rook(PieceColor.BLACK),
  q: new Queen(PieceColor.BLACK),
  k: new King(PieceColor.BLACK),
};
