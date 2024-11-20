export enum PieceName {
  KING = "king",
  QUEEN = "queen",
  BISHOP = "bishop",
  KNIGHT = "knight",
  ROOK = "rook",
  PAWN = "pawn",
}

export enum PieceColor {
  WHITE = "white",
  BLACK = "black",
}

export type PieceType = Readonly<{
  color: PieceColor;
  name: PieceName;
}>;

export type BoardPiece = PieceType | null;

function getBackRow(color: PieceColor): PieceType[] {
  const rook = {
    color,
    name: PieceName.ROOK,
  };
  const knight = {
    color,
    name: PieceName.KNIGHT,
  };
  const bishop = {
    color,
    name: PieceName.BISHOP,
  };
  const queen = {
    color,
    name: PieceName.QUEEN,
  };
  const king = {
    color,
    name: PieceName.KING,
  };

  return [rook, knight, bishop, queen, king, bishop, knight, rook];
}

function getFrontRow(color: PieceColor): PieceType[] {
  const pawn = { color, name: PieceName.PAWN };
  return Array(8).fill(pawn);
}

export function getStartingBoard(): BoardPiece[] {
  const blackBackRow = getBackRow(PieceColor.BLACK);
  const whiteBackRow = getBackRow(PieceColor.WHITE);
  const blackPawns = getFrontRow(PieceColor.BLACK);
  const whitePawns = getFrontRow(PieceColor.WHITE);
  return [
    ...blackBackRow,
    ...blackPawns,
    ...Array(32).fill(null),
    ...whitePawns,
    ...whiteBackRow,
  ];
}
